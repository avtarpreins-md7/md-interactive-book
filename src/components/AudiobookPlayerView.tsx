import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Volume2,
  ZoomIn,
  ZoomOut,
  Lock,
  Coins,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  FileAudio,
  Headphones,
  Moon,
  User,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import {
  ExhibitionBook,
  NarratorVoicePreset,
  AudiobookResumeState,
} from '../types';

export const AUDIOBOOK_RESUME_STORAGE_KEY = 'md_audiobook_resume_v1';
export const FREE_AUDIO_LIMIT_SECONDS = 600; // 10 minutes free listening

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const;

const VOICE_OPTIONS: {
  id: NarratorVoicePreset;
  label: string;
  desc: string;
  pitch: number;
  baseRate: number;
  volume: number;
}[] = [
  {
    id: 'male',
    label: 'صوت راجل',
    desc: 'راوي دافئ وواضح',
    pitch: 0.9,
    baseRate: 0.96,
    volume: 1.0,
  },
  {
    id: 'female',
    label: 'صوت ست',
    desc: 'راوية معبرة وهادئة',
    pitch: 1.1,
    baseRate: 0.98,
    volume: 1.0,
  },
  {
    id: 'sleep',
    label: 'صوت هادي للنوم',
    desc: 'إيقاع بطيء مريح للراحة',
    pitch: 0.85,
    baseRate: 0.82,
    volume: 0.75,
  },
];

const FONT_SCALE_PX = [22, 26, 30, 36];

interface WordToken {
  raw: string;
  isWord: boolean;
  wordIndex: number;
  charStart: number;
  charEnd: number;
  weight: number;
}

function tokenizePageText(text: string): {
  tokens: WordToken[];
  wordTokens: WordToken[];
  totalWeight: number;
} {
  const parts = text.split(/(\s+)/);
  const tokens: WordToken[] = [];
  const wordTokens: WordToken[] = [];
  let charCursor = 0;
  let wordCounter = 0;
  let totalWeight = 0;

  for (const part of parts) {
    if (!part) continue;
    const isWhitespace = /^\s+$/.test(part);
    const charStart = charCursor;
    const charEnd = charCursor + part.length;
    charCursor = charEnd;

    if (isWhitespace) {
      tokens.push({
        raw: part,
        isWord: false,
        wordIndex: -1,
        charStart,
        charEnd,
        weight: 0,
      });
    } else {
      const cleanLetters = part.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '').length;
      const hasMajorPause = /[.؟!\n]$/.test(part);
      const hasMinorPause = /[،,:؛]$/.test(part);
      const weight = Math.max(2, cleanLetters) + (hasMajorPause ? 4.5 : hasMinorPause ? 2.2 : 0.8);
      totalWeight += weight;

      const token: WordToken = {
        raw: part,
        isWord: true,
        wordIndex: wordCounter,
        charStart,
        charEnd,
        weight,
      };
      tokens.push(token);
      wordTokens.push(token);
      wordCounter += 1;
    }
  }

  return { tokens, wordTokens, totalWeight };
}

// Creates an in-memory 1-second silent WAV Blob URL to keep OS lock-screen audio session alive
function createSilentKeepAliveWavUrl(): string {
  const sampleRate = 8000;
  const numSamples = sampleRate; // 1 second
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function selectBestArabicVoice(
  voices: SpeechSynthesisVoice[],
  preset: NarratorVoicePreset
): SpeechSynthesisVoice | null {
  const arVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ar'));
  if (arVoices.length === 0) return null;

  const maleKeywords = ['maged', 'tariq', 'naayf', 'zayd', 'hamed', 'shakir', 'male', 'ar-sa', 'ar-eg'];
  const femaleKeywords = ['laila', 'salma', 'hoda', 'mariam', 'zaria', 'amina', 'fatima', 'female'];
  const naturalBonus = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    let score = 0;
    if (n.includes('natural') || n.includes('neural') || n.includes('online')) score += 10;
    if (n.includes('google')) score += 6;
    if (preset === 'male' && maleKeywords.some((k) => n.includes(k))) score += 5;
    if (preset === 'female' && femaleKeywords.some((k) => n.includes(k))) score += 5;
    if (preset === 'sleep' && (femaleKeywords.some((k) => n.includes(k)) || n.includes('natural'))) score += 4;
    return score;
  };

  const sorted = [...arVoices].sort((a, b) => naturalBonus(b) - naturalBonus(a));
  return sorted[0] || null;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function loadSavedAudiobookResume(bookId?: string): AudiobookResumeState | null {
  try {
    const raw = localStorage.getItem(AUDIOBOOK_RESUME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AudiobookResumeState;
    if (!parsed || typeof parsed.bookId !== 'string') return null;
    if (bookId && parsed.bookId !== bookId) return null;
    return parsed;
  } catch {
    return null;
  }
}

interface AudiobookPlayerViewProps {
  book: ExhibitionBook;
  isOwned: boolean;
  mdPoints: number;
  freeSecondsUsed: number;
  onTickFreeSecond: () => void;
  onPurchaseWithPoints: (book: ExhibitionBook) => boolean;
  onOpenBuy1000Points: () => void;
  onClose: () => void;
  autoPlayOnOpen?: boolean;
}

export const AudiobookPlayerView: React.FC<AudiobookPlayerViewProps> = ({
  book,
  isOwned,
  mdPoints,
  freeSecondsUsed,
  onTickFreeSecond,
  onPurchaseWithPoints,
  onOpenBuy1000Points,
  onClose,
  autoPlayOnOpen = true,
}) => {
  const pages = useMemo(
    () => (book.samplePages && book.samplePages.length > 0 ? book.samplePages : [book.description]),
    [book]
  );

  const savedResume = useMemo(() => loadSavedAudiobookResume(book.id), [book.id]);

  const [pageIndex, setPageIndex] = useState<number>(() => {
    if (savedResume && savedResume.pageIndex >= 0 && savedResume.pageIndex < pages.length) {
      return savedResume.pageIndex;
    }
    return 0;
  });
  const [activeWordIndex, setActiveWordIndex] = useState<number>(() => {
    return savedResume && savedResume.wordIndex >= 0 ? savedResume.wordIndex : 0;
  });
  const [speed, setSpeed] = useState<number>(() => {
    return savedResume && SPEED_OPTIONS.includes(savedResume.speed as (typeof SPEED_OPTIONS)[number])
      ? savedResume.speed
      : 1;
  });
  const [voicePreset, setVoicePreset] = useState<NarratorVoicePreset>(() => {
    return savedResume?.voicePreset || 'male';
  });
  const [fontScaleIdx, setFontScaleIdx] = useState<number>(() => {
    return savedResume && savedResume.fontScale >= 0 && savedResume.fontScale < FONT_SCALE_PX.length
      ? savedResume.fontScale
      : 1;
  });
  const [singlePageOnly, setSinglePageOnly] = useState<boolean>(() => {
    return Boolean(savedResume?.singlePageOnly);
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoadingNeuralAudio, setIsLoadingNeuralAudio] = useState<boolean>(false);
  const [neuralAvailable, setNeuralAvailable] = useState<boolean | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [resumedBanner, setResumedBanner] = useState<boolean>(() =>
    Boolean(savedResume && (savedResume.pageIndex > 0 || savedResume.wordIndex > 0))
  );

  const isUnlimited = isOwned || book.isFreeShowcase;
  const freeRemainingSeconds = Math.max(0, FREE_AUDIO_LIMIT_SECONDS - freeSecondsUsed);
  const isPaywallLocked = !isUnlimited && freeRemainingSeconds <= 0;

  const isUnlimitedRef = useRef(isUnlimited);
  const freeSecondsUsedRef = useRef(freeSecondsUsed);
  isUnlimitedRef.current = isUnlimited;
  freeSecondsUsedRef.current = freeSecondsUsed;

  const currentPageText = pages[pageIndex] || book.description;
  const { tokens, wordTokens } = useMemo(
    () => tokenizePageText(currentPageText),
    [currentPageText]
  );

  // Refs for clean async playback orchestration
  const neuralAudioRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveAudioRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveUrlRef = useRef<string | null>(null);
  const playbackSessionRef = useRef<number>(0);
  const fallbackTimerRef = useRef<number | null>(null);
  const lastBoundaryAtRef = useRef<number>(0);
  const activeWordRef = useRef<number>(activeWordIndex);
  const activeWordElementRef = useRef<HTMLButtonElement | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const autoStartedRef = useRef<boolean>(false);

  activeWordRef.current = activeWordIndex;

  // Check if server-side Gemini Neural Narrator is active
  useEffect(() => {
    isMountedRef.current = true;
    fetch('/api/tts/status')
      .then((r) => r.json())
      .then((data) => {
        if (isMountedRef.current) {
          setNeuralAvailable(Boolean(data?.neuralAvailable));
        }
      })
      .catch(() => {
        if (isMountedRef.current) setNeuralAvailable(false);
      });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load device Arabic speech voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const syncVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length > 0) setAvailableVoices(list);
    };
    syncVoices();
    window.speechSynthesis.addEventListener('voiceschanged', syncVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', syncVoices);
    };
  }, []);

  // Create silent keep-alive audio URL once for lock-screen / background continuity
  useEffect(() => {
    const url = createSilentKeepAliveWavUrl();
    keepAliveUrlRef.current = url;
    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  // Persist exact playback spot continuously & on visibility change
  const saveResumePosition = useCallback(
    (pIdx: number, wIdx: number) => {
      const payload: AudiobookResumeState = {
        bookId: book.id,
        pageIndex: pIdx,
        wordIndex: wIdx,
        speed,
        voicePreset,
        fontScale: fontScaleIdx,
        singlePageOnly,
        updatedAt: Date.now(),
      };
      try {
        localStorage.setItem(AUDIOBOOK_RESUME_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // ignore quota issues
      }
    },
    [book.id, speed, voicePreset, fontScaleIdx, singlePageOnly]
  );

  useEffect(() => {
    saveResumePosition(pageIndex, activeWordIndex);
  }, [pageIndex, activeWordIndex, saveResumePosition]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        saveResumePosition(pageIndex, activeWordRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleVisibility);
    };
  }, [pageIndex, saveResumePosition]);

  // Smooth auto-scroll to active golden highlighted word
  useEffect(() => {
    if (isPlaying && activeWordElementRef.current) {
      activeWordElementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeWordIndex, isPlaying]);

  // 10-minute free listening countdown ticker (runs only when playing unowned book)
  useEffect(() => {
    if (!isPlaying || isPaused || isUnlimited || isPaywallLocked) return;
    const timer = window.setInterval(() => {
      onTickFreeSecond();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, isPaused, isUnlimited, isPaywallLocked, onTickFreeSecond]);

  // Helper: clear active engines safely
  const stopAllEngines = useCallback((resetWord: boolean = false) => {
    playbackSessionRef.current += 1;
    if (fallbackTimerRef.current) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (neuralAudioRef.current) {
      neuralAudioRef.current.pause();
      neuralAudioRef.current.onended = null;
      neuralAudioRef.current.onerror = null;
      neuralAudioRef.current.src = '';
    }
    if (keepAliveAudioRef.current) {
      keepAliveAudioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoadingNeuralAudio(false);
    if (resetWord) {
      setActiveWordIndex(0);
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }, []);

  // Stop playback automatically if the 10-minute free limit expires
  useEffect(() => {
    if (isPaywallLocked && isPlaying) {
      stopAllEngines(false);
      setStatusNotice('انتهت الدقائق العشر المجانية — اشترِ الكتاب بالنقاط لإكمال السماع.');
    }
  }, [isPaywallLocked, isPlaying, stopAllEngines]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAllEngines(false);
    };
  }, [stopAllEngines]);

  // Start playback on a given page and starting word index
  const startPlaybackAt = useCallback(
    async (
      targetPageIdx: number,
      targetWordIdx: number,
      overrideSinglePage?: boolean,
      overrideVoice?: NarratorVoicePreset,
      overrideSpeed?: number,
      bypassPaywall?: boolean
    ) => {
      const targetVoice = overrideVoice || voicePreset;
      const targetSpeed = overrideSpeed || speed;
      const isSingleMode = overrideSinglePage ?? singlePageOnly;

      if (!bypassPaywall && !isUnlimitedRef.current && freeSecondsUsedRef.current >= FREE_AUDIO_LIMIT_SECONDS) {
        stopAllEngines(false);
        return;
      }

      stopAllEngines(false);
      const mySession = ++playbackSessionRef.current;

      const textToRead = pages[targetPageIdx] || book.description;
      const parsed = tokenizePageText(textToRead);
      const safeWordIdx = Math.max(0, Math.min(targetWordIdx, Math.max(0, parsed.wordTokens.length - 1)));
      const startChar = parsed.wordTokens[safeWordIdx]?.charStart ?? 0;
      const sliceText = textToRead.slice(startChar).trim();

      if (!sliceText) {
        setIsPlaying(false);
        return;
      }

      setPageIndex(targetPageIdx);
      setActiveWordIndex(safeWordIdx);
      setIsPlaying(true);
      setIsPaused(false);
      setStatusNotice(null);

      // Update OS lock screen MediaSession metadata
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `${book.title} — صفحة ${targetPageIdx + 1} من ${pages.length}`,
            artist: book.author,
            album: 'معرض الكتاب MD',
            artwork: [{ src: book.cover, sizes: '512x512', type: 'image/png' }],
          });
          navigator.mediaSession.playbackState = 'playing';
        } catch {
          // ignore MediaSession errors
        }
      }

      const handlePageFinished = () => {
        if (playbackSessionRef.current !== mySession || !isMountedRef.current) return;
        if (isSingleMode) {
          stopAllEngines(false);
          setActiveWordIndex(0);
          setStatusNotice(`انتهت قراءة صفحة ${targetPageIdx + 1} فقط.`);
          return;
        }
        if (targetPageIdx + 1 < pages.length) {
          startPlaybackAt(targetPageIdx + 1, 0, isSingleMode, targetVoice, targetSpeed);
        } else {
          stopAllEngines(true);
          setStatusNotice('انتهت قراءة الكتاب بالكامل.');
        }
      };

      // Try Studio Neural Narrator first if Gemini key is configured
      if (neuralAvailable) {
        setIsLoadingNeuralAudio(true);
        try {
          const resp = await fetch('/api/tts/narrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: sliceText,
              voicePreset: targetVoice,
            }),
          });

          if (playbackSessionRef.current !== mySession || !isMountedRef.current) return;

          if (resp.ok) {
            const wavBlob = await resp.blob();
            const wavUrl = URL.createObjectURL(wavBlob);
            const audio = neuralAudioRef.current || new Audio();
            neuralAudioRef.current = audio;
            audio.src = wavUrl;
            audio.playbackRate = targetSpeed;

            const activeSliceWords = parsed.wordTokens.slice(safeWordIdx);
            const sliceTotalWeight = activeSliceWords.reduce((sum, w) => sum + w.weight, 0) || 1;

            audio.onended = () => {
              URL.revokeObjectURL(wavUrl);
              handlePageFinished();
            };

            audio.onerror = () => {
              URL.revokeObjectURL(wavUrl);
              if (playbackSessionRef.current === mySession) {
                setNeuralAvailable(false);
                startDeviceSpeechNarrator(
                  mySession,
                  textToRead,
                  sliceText,
                  startChar,
                  parsed.wordTokens,
                  safeWordIdx,
                  targetVoice,
                  targetSpeed,
                  handlePageFinished
                );
              }
            };

            await audio.play();
            setIsLoadingNeuralAudio(false);

            // Sync word highlighting smoothly across neural WAV duration
            fallbackTimerRef.current = window.setInterval(() => {
              if (
                playbackSessionRef.current !== mySession ||
                !audio.duration ||
                audio.paused
              ) {
                return;
              }
              const ratio = Math.min(0.999, Math.max(0, audio.currentTime / audio.duration));
              const targetWeight = ratio * sliceTotalWeight;
              let acc = 0;
              let chosenIdx = safeWordIdx;
              for (const w of activeSliceWords) {
                acc += w.weight;
                chosenIdx = w.wordIndex;
                if (acc >= targetWeight) break;
              }
              setActiveWordIndex(chosenIdx);
            }, 60);

            return;
          }
        } catch {
          // Fall back gracefully to warm Arabic Web Speech narrator below
        } finally {
          if (isMountedRef.current) setIsLoadingNeuralAudio(false);
        }
      }

      // Warm Natural Device Arabic Narrator + silent keep-alive audio track for background continuity
      startDeviceSpeechNarrator(
        mySession,
        textToRead,
        sliceText,
        startChar,
        parsed.wordTokens,
        safeWordIdx,
        targetVoice,
        targetSpeed,
        handlePageFinished
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [book, pages, voicePreset, speed, singlePageOnly, isUnlimited, freeSecondsUsed, neuralAvailable, stopAllEngines]
  );

  const startDeviceSpeechNarrator = (
    mySession: number,
    fullPageText: string,
    sliceText: string,
    startChar: number,
    allWordTokens: WordToken[],
    safeWordIdx: number,
    targetVoice: NarratorVoicePreset,
    targetSpeed: number,
    onDone: () => void
  ) => {
    if (!('speechSynthesis' in window)) {
      setStatusNotice('المتصفح الحالي لا يدعم القراءة الصوتية المباشرة.');
      setIsPlaying(false);
      return;
    }

    // Start low-level silent keep-alive audio so screen lock / background keeps media session active
    if (keepAliveUrlRef.current) {
      const keepAudio = keepAliveAudioRef.current || new Audio(keepAliveUrlRef.current);
      keepAliveAudioRef.current = keepAudio;
      keepAudio.loop = true;
      keepAudio.volume = 0.01;
      keepAudio.play().catch(() => {
        // Ignore autoplay restrictions
      });
    }

    const presetMeta = VOICE_OPTIONS.find((v) => v.id === targetVoice) || VOICE_OPTIONS[0];
    const utterance = new SpeechSynthesisUtterance(sliceText);
    utterance.lang = 'ar-SA';
    utterance.pitch = presetMeta.pitch;
    utterance.volume = presetMeta.volume;
    utterance.rate = Math.min(2.2, Math.max(0.55, presetMeta.baseRate * targetSpeed));

    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    const chosenVoice = selectBestArabicVoice(voices, targetVoice);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    lastBoundaryAtRef.current = Date.now();
    let localWordCursor = safeWordIdx;

    // Boundary listener maps exact spoken character to highlighted golden word
    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (playbackSessionRef.current !== mySession) return;
      if (typeof event.charIndex === 'number') {
        lastBoundaryAtRef.current = Date.now();
        const absoluteChar = startChar + event.charIndex;
        const found = allWordTokens.find(
          (w) => absoluteChar >= w.charStart && absoluteChar <= w.charEnd + 1
        );
        if (found) {
          localWordCursor = found.wordIndex;
          setActiveWordIndex(found.wordIndex);
        }
      }
    };

    utterance.onend = () => {
      if (fallbackTimerRef.current) {
        window.clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (playbackSessionRef.current === mySession) {
        onDone();
      }
    };

    utterance.onerror = () => {
      if (fallbackTimerRef.current) {
        window.clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (playbackSessionRef.current === mySession && isMountedRef.current) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    // Smooth fallback word tracker in case browser fires boundary sparsely on Arabic text
    const msPerWeightUnit = 68 / Math.max(0.5, utterance.rate);
    let accumulatedMs = 0;
    let lastTickTime = Date.now();

    fallbackTimerRef.current = window.setInterval(() => {
      if (playbackSessionRef.current !== mySession) return;
      const now = Date.now();
      const dt = now - lastTickTime;
      lastTickTime = now;

      if (window.speechSynthesis.paused) return;

      // Only advance heuristically if browser hasn't given a real onboundary event recently
      if (now - lastBoundaryAtRef.current > 460) {
        const currentToken = allWordTokens[localWordCursor];
        const neededMs = (currentToken?.weight || 4) * msPerWeightUnit;
        accumulatedMs += dt;
        if (accumulatedMs >= neededMs && localWordCursor + 1 < allWordTokens.length) {
          accumulatedMs = 0;
          localWordCursor += 1;
          setActiveWordIndex(localWordCursor);
        }
      } else {
        accumulatedMs = 0;
      }
    }, 90);
  };

  // Auto-start playback when opened via "اسمع الكتاب"
  useEffect(() => {
    if (autoPlayOnOpen && !autoStartedRef.current && !isPaywallLocked && neuralAvailable !== null) {
      autoStartedRef.current = true;
      startPlaybackAt(pageIndex, activeWordIndex);
    }
  }, [autoPlayOnOpen, isPaywallLocked, neuralAvailable, pageIndex, activeWordIndex, startPlaybackAt]);

  // Toggle Play / Pause
  const handleTogglePlayPause = () => {
    if (isPaywallLocked) return;
    if (!isPlaying) {
      startPlaybackAt(pageIndex, activeWordIndex);
      return;
    }
    if (isPaused) {
      // Resume (if OS purged paused speechSynthesis, re-speak from exact active word)
      if (neuralAudioRef.current && neuralAudioRef.current.src) {
        neuralAudioRef.current.play().catch(() => {});
      } else if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          keepAliveAudioRef.current?.play().catch(() => {});
        } else {
          startPlaybackAt(pageIndex, activeWordRef.current);
          return;
        }
      }
      setIsPaused(false);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    } else {
      // Pause
      if (neuralAudioRef.current && neuralAudioRef.current.src) {
        neuralAudioRef.current.pause();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
        keepAliveAudioRef.current?.pause();
      }
      setIsPaused(true);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    }
  };

  const handleStop = () => {
    stopAllEngines(true);
    setStatusNotice('تم إيقاف القراءة الصوتية.');
  };

  const handleJumpPage = (newPageIdx: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, newPageIdx));
    setResumedBanner(false);
    if (isPlaying) {
      startPlaybackAt(clamped, 0);
    } else {
      setPageIndex(clamped);
      setActiveWordIndex(0);
    }
  };

  const handleScrubWords = (deltaWords: number) => {
    const nextIdx = Math.max(
      0,
      Math.min(Math.max(0, wordTokens.length - 1), activeWordIndex + deltaWords)
    );
    if (isPlaying) {
      startPlaybackAt(pageIndex, nextIdx);
    } else {
      setActiveWordIndex(nextIdx);
    }
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying && !isPaused) {
      if (neuralAudioRef.current && neuralAudioRef.current.src) {
        neuralAudioRef.current.playbackRate = newSpeed;
      } else {
        startPlaybackAt(pageIndex, activeWordRef.current, undefined, undefined, newSpeed);
      }
    }
  };

  const handleChangeVoice = (newVoice: NarratorVoicePreset) => {
    setVoicePreset(newVoice);
    if (isPlaying && !isPaused) {
      startPlaybackAt(pageIndex, activeWordRef.current, undefined, newVoice, undefined);
    }
  };

  const handleReadThisPageOnly = () => {
    setSinglePageOnly(true);
    setStatusNotice(`وضع القراءة: هذه الصفحة فقط (صفحة ${pageIndex + 1})`);
    startPlaybackAt(pageIndex, 0, true);
  };

  // Wire OS Lock Screen / MediaSession action buttons
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) startPlaybackAt(pageIndex, activeWordRef.current);
        else if (isPaused) handleTogglePlayPause();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying && !isPaused) handleTogglePlayPause();
      });
      navigator.mediaSession.setActionHandler('stop', () => handleStop());
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (pageIndex + 1 < pages.length) handleJumpPage(pageIndex + 1);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (pageIndex > 0) handleJumpPage(pageIndex - 1);
      });
      navigator.mediaSession.setActionHandler('seekforward', () => handleScrubWords(12));
      navigator.mediaSession.setActionHandler('seekbackward', () => handleScrubWords(-12));
    } catch {
      // ignore unsupported MediaSession handlers
    }
  });

  const activeFontSizePx = FONT_SCALE_PX[fontScaleIdx] || 26;

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#05070E] text-white flex flex-col">
      {/* Top Audiobook Header */}
      <header className="sticky top-0 z-40 bg-[#070B17]/95 backdrop-blur-md border-b border-[#D4AF37]/40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              saveResumePosition(pageIndex, activeWordRef.current);
              stopAllEngines(false);
              onClose();
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0B1633] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-xs sm:text-sm font-bold text-[#F3E5AB] flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع للمعرض</span>
          </button>

          <div className="text-center flex-1 min-w-[160px] px-2">
            <h2 className="text-sm sm:text-base font-black text-[#F3E5AB] truncate">
              {book.title}
            </h2>
            <p className="text-[11px] text-slate-300 truncate">
              {book.author} · راوي مسموع · صفحة {pageIndex + 1} من {pages.length}
            </p>
          </div>

          {/* Free Listening Countdown OR Unlocked Badge */}
          <div className="flex items-center gap-2">
            {isUnlimited ? (
              <span className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap">
                <Headphones className="w-4 h-4" />
                <span>استماع مفتوح</span>
              </span>
            ) : (
              <div className="min-h-[44px] px-3 py-2 rounded-xl bg-[#0B1633] border border-[#D4AF37]/50 text-xs font-black text-[#F3E5AB] flex items-center gap-1.5 tabular-nums whitespace-nowrap">
                <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                <span>المجاني: {formatClock(freeRemainingSeconds)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area: Accessibility Controls + Book Text with Golden Highlight */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 pb-64 space-y-4">
        {/* Resume Notice Banner */}
        {resumedBanner && (
          <div className="p-3 rounded-xl bg-[#0B1633] border border-[#D4AF37]/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#F3E5AB] font-bold">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                تمت استعادة آخر موضع استماع: صفحة {pageIndex + 1} · كلمة {activeWordIndex + 1}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setResumedBanner(false);
                handleJumpPage(0);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#05070E] border border-[#D4AF37]/40 text-slate-200 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>البدء من صفحة 1</span>
            </button>
          </div>
        )}

        {/* Accessibility Action Row: "كبر الخط" + "اقرألي الصفحة دي بس" */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#0B1633]/90 border border-[#D4AF37]/35">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFontScaleIdx((prev) => (prev + 1) % FONT_SCALE_PX.length)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#D4AF37] text-[#05070E] font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ZoomIn className="w-4 h-4" />
              <span>كبر الخط</span>
            </button>

            <button
              type="button"
              onClick={() => setFontScaleIdx((prev) => Math.max(0, prev - 1))}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-[#05070E] border border-[#D4AF37]/40 text-[#F3E5AB] font-bold text-xs flex items-center gap-1 cursor-pointer"
              aria-label="تصغير الخط"
            >
              <ZoomOut className="w-4 h-4" />
              <span>تصغير</span>
            </button>

            <span className="text-xs text-slate-300 tabular-nums px-1">
              حجم: {activeFontSizePx}px
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReadThisPageOnly}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer border ${
                singlePageOnly
                  ? 'bg-[#D4AF37] text-[#05070E] border-[#D4AF37]'
                  : 'bg-[#05070E] text-[#F3E5AB] border-[#D4AF37]/60 hover:border-[#D4AF37]'
              }`}
            >
              <FileAudio className="w-4 h-4" />
              <span>اقرألي الصفحة دي بس</span>
            </button>

            {singlePageOnly && (
              <button
                type="button"
                onClick={() => {
                  setSinglePageOnly(false);
                  setStatusNotice('وضع القراءة: استمرار تلقائي للصفحات');
                }}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-[#05070E] border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                كمل الكتاب كله
              </button>
            )}
          </div>
        </div>

        {/* Status Toast / Mode Feedback */}
        {(statusNotice || isLoadingNeuralAudio) && (
          <div className="px-4 py-2.5 rounded-xl bg-[#0B1633] border border-[#D4AF37]/50 text-xs sm:text-sm text-[#F3E5AB] font-bold flex items-center justify-between">
            <span>
              {isLoadingNeuralAudio ? 'جارٍ تحضير صوت الراوي الواضح...' : statusNotice}
            </span>
            <span className="text-[11px] text-slate-400">
              {neuralAvailable ? 'راوي استوديو' : 'راوي عربي واضح'}
            </span>
          </div>
        )}

        {/* 10-MINUTE FREE LISTENING PAYWALL GATE */}
        {isPaywallLocked ? (
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0B1633] to-[#070B17] border-2 border-[#D4AF37] text-center space-y-5 shadow-2xl my-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#05070E] border-2 border-[#D4AF37] flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-black text-[#F3E5AB]">
                انتهت الدقائق العشر المجانية للاستماع
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                لإكمال سماع «{book.title}» من صفحة {pageIndex + 1}، اشتريه الآن بنقاط MD ليُفتح لك بالكامل قراءةً واستماعاً.
              </p>
            </div>

            <div className="max-w-sm mx-auto p-4 rounded-2xl bg-[#05070E] border border-[#D4AF37]/40 space-y-1 text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-400">سعر الكتاب:</span>
                <span className="font-black text-[#F3E5AB]">{book.pricePoints} نقطة MD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رصيدك الحالي:</span>
                <span className="font-black text-white">{mdPoints} نقطة MD</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {mdPoints >= book.pricePoints ? (
                <button
                  type="button"
                  onClick={() => {
                    const ok = onPurchaseWithPoints(book);
                    if (ok) {
                      setTimeout(
                        () => startPlaybackAt(pageIndex, activeWordIndex, undefined, undefined, undefined, true),
                        100
                      );
                    }
                  }}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-[#05070E] font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>شراء الكتاب بالنقاط ({book.pricePoints} نقطة MD) وإكمال السماع</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenBuy1000Points}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-[#05070E] font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Coins className="w-4 h-4" />
                  <span>رصيدك لا يكفي — اشتري 1000 نقطة الأول</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* READABLE BOOK PAGE WITH LIVE GOLDEN WORD HIGHLIGHTING */
          <section className="rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#0B1633]/85 to-[#070B17] border border-[#D4AF37]/45 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D4AF37]/25 text-xs text-slate-300">
              <span className="font-bold text-[#F3E5AB]">
                صفحة {pageIndex + 1} من {pages.length}
              </span>
              <span>اضغط على أي كلمة للبدء من عندها</span>
            </div>

            <div
              style={{ fontSize: `${activeFontSizePx}px`, lineHeight: 2.15 }}
              className="text-right font-sans text-slate-100 select-text"
            >
              {tokens.map((tok, i) => {
                if (!tok.isWord) {
                  return tok.raw.includes('\n') ? (
                    <React.Fragment key={`ws-${i}`}>
                      {tok.raw.split('\n').map((part, nlIdx) => (
                        <React.Fragment key={nlIdx}>
                          {nlIdx > 0 && <br />}
                          {part}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ) : (
                    <React.Fragment key={`ws-${i}`}>{tok.raw}</React.Fragment>
                  );
                }

                const isHighlighted = tok.wordIndex === activeWordIndex && (isPlaying || activeWordIndex > 0);
                return (
                  <button
                    key={`w-${tok.wordIndex}`}
                    ref={tok.wordIndex === activeWordIndex ? activeWordElementRef : null}
                    type="button"
                    onClick={() => startPlaybackAt(pageIndex, tok.wordIndex)}
                    className={`inline-block rounded-lg px-1 py-0.5 transition-colors duration-150 cursor-pointer text-right ${
                      isHighlighted
                        ? 'bg-[#D4AF37] text-[#05070E] font-black shadow-[0_0_14px_rgba(212,175,55,0.8)] scale-[1.03]'
                        : 'hover:bg-[#172E69]/70 text-slate-100'
                    }`}
                  >
                    {tok.raw}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* STICKY BOTTOM AUDIO PLAYER DECK (Black + Navy + Gold) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#070B17]/98 backdrop-blur-xl border-t-2 border-[#D4AF37] px-3 sm:px-6 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.85)]">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Progress Bar: Page X of Y + Scrub Forward/Backward */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300 tabular-nums">
              <span className="font-black text-[#F3E5AB]">
                صفحة {pageIndex + 1} من {pages.length}
              </span>
              <span>
                كلمة {Math.min(activeWordIndex + 1, Math.max(1, wordTokens.length))} من{' '}
                {Math.max(1, wordTokens.length)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pageIndex <= 0}
                onClick={() => handleJumpPage(pageIndex - 1)}
                className="min-h-[38px] px-2.5 rounded-lg bg-[#0B1633] border border-[#D4AF37]/40 text-xs font-bold text-[#F3E5AB] flex items-center gap-1 cursor-pointer disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="hidden sm:inline">صفحة سابقة</span>
              </button>

              <input
                type="range"
                min={0}
                max={Math.max(0, pages.length - 1)}
                value={pageIndex}
                onChange={(e) => handleJumpPage(Number(e.target.value))}
                aria-label="شريط تقدم الصفحات"
                className="flex-1 accent-[#D4AF37] cursor-pointer h-2 rounded-lg bg-[#0B1633]"
              />

              <button
                type="button"
                disabled={pageIndex >= pages.length - 1}
                onClick={() => handleJumpPage(pageIndex + 1)}
                className="min-h-[38px] px-2.5 rounded-lg bg-[#0B1633] border border-[#D4AF37]/40 text-xs font-bold text-[#F3E5AB] flex items-center gap-1 cursor-pointer disabled:opacity-30"
              >
                <span className="hidden sm:inline">صفحة تالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Play/Pause/Stop + Seek Forward/Backward Words */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Scrub Back Words */}
              <button
                type="button"
                onClick={() => handleScrubWords(-10)}
                className="min-h-[44px] px-3 rounded-xl bg-[#0B1633] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                title="ارجع للخلف"
              >
                <SkipForward className="w-4 h-4 text-[#D4AF37]" />
                <span>ورا</span>
              </button>

              {/* Play / Pause */}
              <button
                type="button"
                disabled={isPaywallLocked}
                onClick={handleTogglePlayPause}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-[#05070E] font-black text-sm flex items-center gap-2 cursor-pointer shadow-[0_0_18px_rgba(212,175,55,0.45)] disabled:opacity-40"
              >
                {isPlaying && !isPaused ? (
                  <>
                    <Pause className="w-4 h-4 fill-[#05070E]" />
                    <span>إيقاف مؤقت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-[#05070E]" />
                    <span>{isPaused ? 'استكمال' : 'تشغيل'}</span>
                  </>
                )}
              </button>

              {/* Stop */}
              <button
                type="button"
                onClick={handleStop}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#05070E] border border-[#D4AF37]/50 hover:border-[#D4AF37] text-xs font-black text-[#F3E5AB] flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-[#F3E5AB]" />
                <span>إيقاف</span>
              </button>

              {/* Scrub Forward Words */}
              <button
                type="button"
                onClick={() => handleScrubWords(10)}
                className="min-h-[44px] px-3 rounded-xl bg-[#0B1633] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                title="اجري قدام"
              >
                <span>قدام</span>
                <SkipBack className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>

            {/* Speed Selector: 0.75x - 1x - 1.25x - 1.5x - 2x */}
            <div className="flex items-center gap-1 bg-[#05070E] p-1 rounded-xl border border-[#D4AF37]/30 overflow-x-auto">
              {SPEED_OPTIONS.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => handleChangeSpeed(sp)}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-black tabular-nums cursor-pointer ${
                    speed === sp
                      ? 'bg-[#D4AF37] text-[#05070E]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection Row: صوت راجل / صوت ست / صوت هادي للنوم */}
          <div className="grid grid-cols-3 gap-2">
            {VOICE_OPTIONS.map((v) => {
              const selected = voicePreset === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleChangeVoice(v.id)}
                  className={`min-h-[42px] px-2.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                    selected
                      ? 'bg-[#15285C] border-[#D4AF37] text-[#F3E5AB] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                      : 'bg-[#05070E] border-slate-800 text-slate-300 hover:border-[#D4AF37]/40'
                  }`}
                >
                  {v.id === 'sleep' ? (
                    <Moon className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  )}
                  <span className="truncate">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Headphones, Play, Pause, Volume2, VolumeX, ExternalLink, Radio } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

const MD3_AUDIO_URL = 'https://md3-musician.vercel.app/';

const TRACKS = [
  { id: 'waves-harmonics', title: 'أمواج بحر نون ونغمات التأمل', subtitle: 'MD3 Ambient · صوت مدمج' },
  { id: 'noon-resonance', title: 'تردد حرف النون العميق', subtitle: 'MD3 Resonance · صوت تأملي' },
];

export const MD3MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(audioEngine.getMuted());
  const [trackIndex, setTrackIndex] = useState(0);

  const currentTrack = TRACKS[trackIndex];

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stopOceanWaves();
      setIsPlaying(false);
    } else {
      if (isMuted) {
        audioEngine.toggleMute();
        setIsMuted(false);
      }
      audioEngine.startOceanWaves();
      if (trackIndex === 1) {
        audioEngine.pronounceNoon();
      }
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = audioEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSwitchTrack = () => {
    const nextIdx = (trackIndex + 1) % TRACKS.length;
    setTrackIndex(nextIdx);
    if (nextIdx === 1) {
      audioEngine.pronounceNoon();
    } else {
      audioEngine.playGoldenChime();
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B102E]/95 backdrop-blur-md border-t-2 border-[#7C3AED] text-white px-4 py-2 shadow-lg"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Right: Purple MD3 Reserved Identity + Track Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center shrink-0 shadow-sm">
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-xs font-extrabold text-purple-200 truncate">
              {currentTrack.title}
            </div>
            <div className="text-[11px] text-purple-300/80 truncate">
              {currentTrack.subtitle}
            </div>
          </div>
        </div>

        {/* Center/Left Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="px-3 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'إيقاف' : 'اسمع وانت بتقرأ'}</span>
          </button>

          <button
            type="button"
            onClick={handleSwitchTrack}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-xs text-purple-200 hover:text-white cursor-pointer"
            title="تبديل المسار الصوتي"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>مسار آخر</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-purple-950/70 border border-purple-500/40 text-purple-200 hover:text-white cursor-pointer"
            aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <a
            href={MD3_AUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg border border-purple-400/50 bg-purple-900/50 text-purple-100 hover:bg-[#7C3AED] text-xs font-bold flex items-center gap-1 whitespace-nowrap"
          >
            <span>MD3</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

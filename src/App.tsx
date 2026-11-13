/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import { GoldenOceanScene } from './components/GoldenOceanScene';
import { BookHolder } from './components/BookHolder';
import { BookReader } from './components/BookReader';
import { CompletionScreen } from './components/CompletionScreen';
import { ResumeReadingModal } from './components/ResumeReadingModal';
import { ReviewModal } from './components/ReviewModal';
import { MD7AppsModal } from './components/MD7AppsModal';
import { PublishBookModal } from './components/PublishBookModal';
import { BookLaunchCountdown } from './components/BookLaunchCountdown';
import { AuthorAccessModal } from './components/AuthorAccessModal';
import { AuthorPreviewBanner } from './components/AuthorPreviewBanner';
import { INITIAL_REVIEWS } from './data/bookContent';
import { BOOK_STRUCTURE_CONFIG } from './data/bookStructureConfig';
import { ReaderReview, ReadingProgress } from './types';
import { audioEngine } from './utils/audioEngine';

type ActiveScreen = 'countdown' | 'ocean' | 'pedestal' | 'reader' | 'completion';

export default function App() {
  const [, startTransition] = useTransition();

  // Check launch time: 11 November 2026, 11:11 PM Cairo Time (UTC+2 => 21:11:00Z)
  const targetLaunchTimestamp = new Date(BOOK_STRUCTURE_CONFIG.targetLaunchCairo).getTime();
  
  // Real time vs target check
  const [isNaturallyLaunched, setIsNaturallyLaunched] = useState<boolean>(() => {
    return Date.now() >= targetLaunchTimestamp;
  });

  // Dedicated Author Preview Mode for Mohamed El-Hammam
  // Authenticated securely via server token - NO query string bypass allowed!
  const [isAuthorPreview, setIsAuthorPreview] = useState<boolean>(false);
  const [showAuthorModal, setShowAuthorModal] = useState<boolean>(false);

  // Validate server-side author session on mount
  useEffect(() => {
    const verifyStoredSession = async () => {
      try {
        const storedToken = sessionStorage.getItem('noon_author_token');
        if (!storedToken) return;

        const res = await fetch('/api/author/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            setIsAuthorPreview(true);
            setActiveScreen((prev) => (prev === 'countdown' ? 'pedestal' : prev));
          } else {
            sessionStorage.removeItem('noon_author_token');
            setIsAuthorPreview(false);
          }
        } else {
          sessionStorage.removeItem('noon_author_token');
          setIsAuthorPreview(false);
        }
      } catch (e) {
        console.warn('Session verification fallback', e);
      }
    };

    verifyStoredSession();
  }, []);

  // Accessible if officially launched OR if the author is authenticated in preview mode
  const isAccessible = isNaturallyLaunched || isAuthorPreview;

  // Active Screen state
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(() => {
    if (Date.now() >= targetLaunchTimestamp) return 'ocean';
    return 'countdown';
  });

  const [readingPage, setReadingPage] = useState<number>(1);
  const [savedProgress, setSavedProgress] = useState<ReadingProgress | null>(null);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showAppsModal, setShowAppsModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

  const [reviews, setReviews] = useState<ReaderReview[]>(() => {
    try {
      const stored = localStorage.getItem('md_reader_reviews');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  // Watch real-time clock to trigger launch automatically at 11:11 PM Cairo time
  useEffect(() => {
    const checkTimer = () => {
      if (Date.now() >= targetLaunchTimestamp && !isNaturallyLaunched) {
        setIsNaturallyLaunched(true);
        audioEngine.playGoldenChime();
        if (activeScreen === 'countdown') {
          setActiveScreen('ocean');
        }
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [targetLaunchTimestamp, isNaturallyLaunched, activeScreen]);

  // Gatekeeper Enforcement: Ensure direct navigation cannot bypass launch date for ordinary visitors
  useEffect(() => {
    if (!isAccessible && activeScreen !== 'countdown') {
      setActiveScreen('countdown');
    }
  }, [isAccessible, activeScreen]);

  // Check saved progress on initial mount (only if accessible)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('md_book_progress');
      if (stored) {
        const parsed: ReadingProgress = JSON.parse(stored);
        if (parsed.currentPage > 1 && !parsed.isCompleted && isAccessible) {
          setSavedProgress(parsed);
          setShowResumeModal(true);
        }
      }
    } catch (e) {
      console.warn('Error reading saved progress', e);
    }
  }, [isAccessible]);

  // Save reviews to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem('md_reader_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.warn('Error storing reviews', e);
    }
  }, [reviews]);

  // Handle adding a new review in real-time
  const handleAddReview = (name: string, rating: number, comment: string) => {
    const newRev: ReaderReview = {
      id: `rev-${Date.now()}`,
      name,
      rating,
      comment,
      timestamp: 'الآن',
      isVerified: true
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  // Author Preview Mode Activation with server token
  const handleConfirmAuthor = (token: string) => {
    try {
      sessionStorage.setItem('noon_author_token', token);
    } catch {}
    setIsAuthorPreview(true);
    setActiveScreen('pedestal');
  };

  // Author Exit Preview Mode
  const handleExitAuthorPreview = () => {
    try {
      sessionStorage.removeItem('noon_author_token');
    } catch {}
    setIsAuthorPreview(false);
    setActiveScreen('countdown');
  };

  // Natural Launch Trigger (Automatic upon clock arrival)
  const handleNaturalLaunchUnlock = () => {
    setIsNaturallyLaunched(true);
    audioEngine.playGoldenChime();
    setActiveScreen('ocean');
  };

  // Resume Reading Handler
  const handleResume = () => {
    if (savedProgress && isAccessible) {
      setReadingPage(savedProgress.currentPage);
      setActiveScreen('reader');
      setShowResumeModal(false);
      audioEngine.playBookOpen();
    }
  };

  // Restart Journey Handler
  const handleRestart = () => {
    setReadingPage(1);
    try {
      localStorage.removeItem('md_book_progress');
    } catch {}
    setShowResumeModal(false);
    setActiveScreen(isAccessible ? 'ocean' : 'countdown');
  };

  return (
    <div className={`relative min-h-screen bg-[#050505] text-[#F3E5AB] font-sans antialiased overflow-x-hidden ${isAuthorPreview && activeScreen !== 'countdown' ? 'pt-10' : ''}`}>
      {/* Author Preview Mode Luxury Ribbon */}
      {isAuthorPreview && activeScreen !== 'countdown' && (
        <AuthorPreviewBanner
          onExitPreview={handleExitAuthorPreview}
          currentScreen={activeScreen}
          onNavigateScreen={(scr) => {
            startTransition(() => {
              setActiveScreen(scr);
            });
          }}
        />
      )}

      {/* Screen 0: Pre-Launch Gatekeeper & Countdown (Active before 11:11 PM Cairo Time) */}
      {activeScreen === 'countdown' && (
        <BookLaunchCountdown
          onLaunchUnlock={handleNaturalLaunchUnlock}
          onOpenAuthorModal={() => setShowAuthorModal(true)}
          onOpenAppsModal={() => setShowAppsModal(true)}
        />
      )}

      {/* Screen 1: The Golden Black Sea & Noon letter */}
      {activeScreen === 'ocean' && isAccessible && (
        <GoldenOceanScene
          onEnterJourney={() => {
            setActiveScreen('pedestal');
          }}
          onOpenAppsModal={() => setShowAppsModal(true)}
          onOpenPublishModal={() => setShowPublishModal(true)}
        />
      )}

      {/* Screen 2: 3D Book Holder & Pedestal */}
      {activeScreen === 'pedestal' && isAccessible && (
        <BookHolder
          onOpenBook={() => {
            setActiveScreen('reader');
          }}
          onBackToOcean={() => {
            setActiveScreen('ocean');
          }}
          onOpenAppsModal={() => setShowAppsModal(true)}
        />
      )}

      {/* Screen 3: Interactive Book Reader (All 21 Pages Unabbreviated + Glossary + Back Cover) */}
      {activeScreen === 'reader' && isAccessible && (
        <BookReader
          initialPage={readingPage}
          onCloseBook={() => {
            setActiveScreen('pedestal');
          }}
          onFinishJourney={() => {
            setActiveScreen('completion');
          }}
          reviews={reviews}
          onAddReview={handleAddReview}
          onOpenAppsModal={() => setShowAppsModal(true)}
          onOpenPublishModal={() => setShowPublishModal(true)}
        />
      )}

      {/* Screen 4: Completion & Legacy Manifesto */}
      {activeScreen === 'completion' && isAccessible && (
        <CompletionScreen
          onRestart={() => {
            setReadingPage(1);
            setActiveScreen('reader');
          }}
          onOpenReviewModal={() => {
            setShowReviewModal(true);
          }}
          onBackToOcean={() => {
            setActiveScreen('ocean');
          }}
          onOpenAppsModal={() => setShowAppsModal(true)}
          onOpenPublishModal={() => setShowPublishModal(true)}
        />
      )}

      {/* Author Access Modal */}
      <AuthorAccessModal
        isOpen={showAuthorModal}
        onClose={() => setShowAuthorModal(false)}
        onConfirmAuthor={handleConfirmAuthor}
      />

      {/* Resume Previous Progress Modal */}
      {savedProgress && isAccessible && (
        <ResumeReadingModal
          isOpen={showResumeModal}
          progress={savedProgress}
          onResume={handleResume}
          onRestart={handleRestart}
        />
      )}

      {/* Global Interactive Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitReview={handleAddReview}
      />

      {/* MD7 Applications Ecosystem Modal */}
      <MD7AppsModal
        isOpen={showAppsModal}
        onClose={() => setShowAppsModal(false)}
      />

      {/* Digital Book Publishing Request Modal */}
      <PublishBookModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
      />
    </div>
  );
}

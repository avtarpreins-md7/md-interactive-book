/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoldenOceanScene } from './components/GoldenOceanScene';
import { BookHolder } from './components/BookHolder';
import { BookReader } from './components/BookReader';
import { CompletionScreen } from './components/CompletionScreen';
import { ResumeReadingModal } from './components/ResumeReadingModal';
import { ReviewModal } from './components/ReviewModal';
import { MD7AppsModal } from './components/MD7AppsModal';
import { PublishBookModal } from './components/PublishBookModal';
import { INITIAL_REVIEWS } from './data/bookContent';
import { ReaderReview, ReadingProgress } from './types';
import { audioEngine } from './utils/audioEngine';

type ActiveScreen = 'ocean' | 'pedestal' | 'reader' | 'completion';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('ocean');
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

  // Check saved progress on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('md_book_progress');
      if (stored) {
        const parsed: ReadingProgress = JSON.parse(stored);
        if (parsed.currentPage > 1 && !parsed.isCompleted) {
          setSavedProgress(parsed);
          setShowResumeModal(true);
        }
      }
    } catch (e) {
      console.warn('Error reading saved progress', e);
    }
  }, []);

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

  // Resume Reading Handler
  const handleResume = () => {
    if (savedProgress) {
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
    setActiveScreen('ocean');
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F3E5AB] font-sans antialiased overflow-x-hidden">
      {/* Screen 1: The Golden Black Sea & Noon letter */}
      {activeScreen === 'ocean' && (
        <GoldenOceanScene
          onEnterJourney={() => {
            setActiveScreen('pedestal');
          }}
          onOpenAppsModal={() => setShowAppsModal(true)}
          onOpenPublishModal={() => setShowPublishModal(true)}
        />
      )}

      {/* Screen 2: 3D Book Holder & Pedestal */}
      {activeScreen === 'pedestal' && (
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

      {/* Screen 3: Interactive Book Reader */}
      {activeScreen === 'reader' && (
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
      {activeScreen === 'completion' && (
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

      {/* Resume Previous Progress Modal */}
      {savedProgress && (
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

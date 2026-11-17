import React, { useState, useEffect, useCallback } from 'react';
import { Gift, X } from 'lucide-react';
import { UnifiedPlatformProvider, useUnifiedPlatform } from './context/UnifiedPlatformContext';
import { BookPlatformHome } from './components/BookPlatformHome';
import { LibraryView } from './components/LibraryView';
import { PublisherPortal } from './components/PublisherPortal';
import { GoldenOceanScene } from './components/GoldenOceanScene';
import { BookHolder } from './components/BookHolder';
import { BookReader } from './components/BookReader';
import { CompletionScreen } from './components/CompletionScreen';
import { BookAuditView } from './components/BookAuditView';
import { CentralWalletModal } from './components/CentralWalletModal';
import { RoleAuthModal } from './components/RoleAuthModal';
import { MD7AppsModal } from './components/MD7AppsModal';
import { PublishBookModal } from './components/PublishBookModal';
import { ReviewModal } from './components/ReviewModal';
import { AuthorAccessModal } from './components/AuthorAccessModal';
import { AuthorPreviewBanner } from './components/AuthorPreviewBanner';
import { MD3MusicPlayer } from './components/MD3MusicPlayer';
import { BookExhibitionView } from './components/BookExhibitionView';
import { UserRole } from './types';
import { audioEngine } from './utils/audioEngine';

type RouteState =
  | { view: 'home' }
  | { view: 'exhibition' }
  | { view: 'library' }
  | { view: 'publisher' }
  | { view: 'pedestal'; bookId: string }
  | { view: 'ocean'; bookId: string }
  | { view: 'reader'; bookId: string; page: number }
  | { view: 'completion'; bookId: string }
  | { view: 'audit'; bookId: string };

function parseHashRoute(): RouteState {
  if (typeof window !== 'undefined' && window.location.pathname === '/exhibition' && !window.location.hash) {
    return { view: 'exhibition' };
  }
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const parts = raw.split('/').filter(Boolean);

  if (parts.length === 0) return { view: 'home' };
  if (parts[0] === 'exhibition') return { view: 'exhibition' };
  if (parts[0] === 'library') return { view: 'library' };
  if (parts[0] === 'publisher') return { view: 'publisher' };
  if (parts[0] === 'book' && parts[1]) {
    const bookId = parts[1];
    if (parts[2] === 'ocean') return { view: 'ocean', bookId };
    if (parts[2] === 'read') {
      const page = Math.max(1, parseInt(parts[3] || '1', 10) || 1);
      return { view: 'reader', bookId, page };
    }
    if (parts[2] === 'completion') return { view: 'completion', bookId };
    if (parts[2] === 'audit') return { view: 'audit', bookId };
    return { view: 'pedestal', bookId };
  }
  return { view: 'home' };
}

function setHashRoute(hashPath: string) {
  const target = hashPath.startsWith('#') ? hashPath : `#${hashPath}`;
  if (window.location.hash !== target) {
    window.location.hash = target;
  }
}

const LiveGiftToast: React.FC = () => {
  const { liveGiftEvent, dismissLiveGift } = useUnifiedPlatform();
  if (!liveGiftEvent) return null;

  return (
    <div
      dir="rtl"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[92%] rounded-2xl bg-gradient-to-r from-[#2B1C11] via-[#3D2919] to-[#2B1C11] border-2 border-[#D4AF37] text-white px-4 py-3 shadow-2xl flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#2B1C11] flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5" />
        </div>
        <div className="text-xs leading-snug">
          <div className="font-black text-[#F5D68E]">إشعار بث مباشر · هدية دعم فوري</div>
          <div>
            أرسل <strong>{liveGiftEvent.supporterName}</strong> هدية{' '}
            <strong className="text-[#F5D68E]">{liveGiftEvent.coins} عملات</strong> (بدون عمولة · -1 نقطة تقدم)
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={dismissLiveGift}
        className="p-1 rounded hover:bg-white/10 text-amber-200 cursor-pointer"
        aria-label="إغلاق"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const AppShell: React.FC = () => {
  const { reviews, addReview } = useUnifiedPlatform();
  const [route, setRoute] = useState<RouteState>(() => parseHashRoute());

  const [showCentralCard, setShowCentralCard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('reader');
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [reviewTargetBookId, setReviewTargetBookId] = useState<string | null>(null);

  // Author Preview Authentication state
  const [isAuthorPreview, setIsAuthorPreview] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const verifyStoredSession = async () => {
      try {
        const storedToken = sessionStorage.getItem('noon_author_token');
        if (!storedToken) return;
        const res = await fetch('/api/author/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.valid) setIsAuthorPreview(true);
          else sessionStorage.removeItem('noon_author_token');
        }
      } catch {
        // silent fallback
      }
    };
    verifyStoredSession();
  }, []);

  const handleConfirmAuthor = (token: string) => {
    try {
      sessionStorage.setItem('noon_author_token', token);
    } catch {}
    setIsAuthorPreview(true);
    setHashRoute('/book/noon/read/1');
  };

  const handleExitAuthorPreview = () => {
    try {
      sessionStorage.removeItem('noon_author_token');
    } catch {}
    setIsAuthorPreview(false);
    setHashRoute('/');
  };

  const openAuthWithRole = useCallback((role: UserRole = 'reader') => {
    setAuthDefaultRole(role);
    setShowAuthModal(true);
  }, []);

  const handleReaderPageChange = useCallback(
    (pageNum: number) => {
      if (route.view === 'reader' && route.page !== pageNum) {
        window.history.replaceState(null, '', `#/book/${route.bookId}/read/${pageNum}`);
      }
    },
    [route]
  );

  return (
    <div className={`min-h-screen font-sans antialiased ${isAuthorPreview ? 'pt-11' : ''}`}>
      <LiveGiftToast />

      {isAuthorPreview && (
        <AuthorPreviewBanner
          onExitPreview={handleExitAuthorPreview}
          currentScreen={
            route.view === 'ocean' || route.view === 'pedestal' || route.view === 'reader' || route.view === 'audit'
              ? route.view
              : 'home'
          }
          onNavigateScreen={(scr) => {
            if (scr === 'home') setHashRoute('/');
            else if (scr === 'ocean') setHashRoute('/book/noon/ocean');
            else if (scr === 'pedestal') setHashRoute('/book/noon');
            else if (scr === 'reader') setHashRoute('/book/noon/read/1');
            else if (scr === 'audit') setHashRoute('/book/noon/audit');
          }}
        />
      )}

      {route.view === 'home' && (
        <BookPlatformHome
          onOpenAuthModal={openAuthWithRole}
          onOpenCentralCard={() => setShowCentralCard(true)}
          onNavigateLibrary={() => setHashRoute('/library')}
          onNavigatePublisher={() => setHashRoute('/publisher')}
          onOpenBookHolder={(bookId) => setHashRoute(`/book/${bookId}`)}
          onOpenBookReader={(bookId) => setHashRoute(`/book/${bookId}/read/1`)}
          onOpenReviewForBook={(bookId) => setReviewTargetBookId(bookId)}
          onOpenAppsModal={() => setShowAppsModal(true)}
          onOpenAuthorModal={() => setShowAuthorModal(true)}
          onNavigateExhibition={() => setHashRoute('/exhibition')}
        />
      )}

      {route.view === 'exhibition' && (
        <BookExhibitionView
          onBackToPlatform={() => {
            if (window.location.pathname === '/exhibition') {
              window.history.replaceState(null, '', '/');
            }
            setHashRoute('/');
          }}
          onOpenFullNoonReader={() => setHashRoute('/book/noon/read/1')}
        />
      )}

      {route.view === 'library' && (
        <LibraryView
          onBackHome={() => setHashRoute('/')}
          onOpenBookHolder={(bookId) => setHashRoute(`/book/${bookId}`)}
          onOpenBookReader={(bookId) => setHashRoute(`/book/${bookId}/read/1`)}
          onOpenReviewForBook={(bookId) => setReviewTargetBookId(bookId)}
          onOpenCentralCard={() => setShowCentralCard(true)}
        />
      )}

      {route.view === 'publisher' && (
        <PublisherPortal
          onBackHome={() => setHashRoute('/')}
          onOpenCentralCard={() => setShowCentralCard(true)}
          onOpenBookReader={(bookId) => setHashRoute(`/book/${bookId}/read/1`)}
          onOpenMailPublishModal={() => setShowPublishModal(true)}
        />
      )}

      {route.view === 'pedestal' && (
        <BookHolder
          onOpenBook={() => setHashRoute(`/book/${route.bookId}/read/1`)}
          onBackHome={() => setHashRoute('/')}
          onOpenOcean={() => setHashRoute(`/book/${route.bookId}/ocean`)}
          onOpenAppsModal={() => setShowAppsModal(true)}
        />
      )}

      {route.view === 'ocean' && (
        <GoldenOceanScene
          onEnterJourney={() => setHashRoute(`/book/${route.bookId}`)}
          onOpenAppsModal={() => setShowAppsModal(true)}
          onOpenPublishModal={() => setShowPublishModal(true)}
        />
      )}

      {route.view === 'reader' && (
        <BookReader
          bookId={route.bookId}
          initialPage={route.page}
          onCloseBook={() => setHashRoute(`/book/${route.bookId}`)}
          onFinishJourney={() => setHashRoute(`/book/${route.bookId}/completion`)}
          onPageChange={handleReaderPageChange}
          onOpenAudit={() => setHashRoute(`/book/${route.bookId}/audit`)}
          reviews={reviews}
          onAddReview={(name, rating, comment) => addReview(route.bookId, name, rating, comment)}
          onOpenAppsModal={() => setShowAppsModal(true)}
          onOpenPublishModal={() => setShowPublishModal(true)}
        />
      )}

      {route.view === 'completion' && (
        <CompletionScreen
          onRestart={() => setHashRoute(`/book/${route.bookId}/read/1`)}
          onOpenReviewModal={() => setReviewTargetBookId(route.bookId)}
          onBackHome={() => setHashRoute('/')}
          onOpenAppsModal={() => setShowAppsModal(true)}
          onOpenPublishModal={() => setShowPublishModal(true)}
        />
      )}

      {route.view === 'audit' && (
        <BookAuditView
          onBack={() => setHashRoute('/book/noon/read/1')}
          onOpenReaderAtChapter={(p) => setHashRoute(`/book/noon/read/${p}`)}
        />
      )}

      {/* Persistent Sticky MD3 Music Player (Purple #7C3AED) — hidden in standalone exhibition */}
      {route.view !== 'exhibition' && <MD3MusicPlayer />}

      {/* Modals */}
      <CentralWalletModal isOpen={showCentralCard} onClose={() => setShowCentralCard(false)} />

      <RoleAuthModal
        isOpen={showAuthModal}
        initialRole={authDefaultRole}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(role) => {
          audioEngine.playGoldenChime();
          if (role === 'publisher') setHashRoute('/publisher');
          else setHashRoute('/library');
        }}
      />

      <MD7AppsModal isOpen={showAppsModal} onClose={() => setShowAppsModal(false)} />

      <PublishBookModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} />

      <AuthorAccessModal
        isOpen={showAuthorModal}
        onClose={() => setShowAuthorModal(false)}
        onConfirmAuthor={handleConfirmAuthor}
      />

      <ReviewModal
        isOpen={reviewTargetBookId !== null}
        onClose={() => setReviewTargetBookId(null)}
        onSubmitReview={(name, rating, comment) => {
          if (reviewTargetBookId) {
            addReview(reviewTargetBookId, name, rating, comment);
          }
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <UnifiedPlatformProvider>
      <AppShell />
    </UnifiedPlatformProvider>
  );
}

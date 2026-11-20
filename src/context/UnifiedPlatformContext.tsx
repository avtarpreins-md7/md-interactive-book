import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PlatformAccountProfile,
  PlatformBookItem,
  PlatformId,
  PlatformLevelInfo,
  ReaderReview,
  SupporterEntry,
  UserRole,
  WalletTransaction,
  LiveGiftEvent,
} from '../types';
import { BUILT_IN_BOOKS } from '../books/registry';
import { INITIAL_REVIEWS } from '../data/bookContent';
import { audioEngine } from '../utils/audioEngine';

const STORAGE_KEY = 'md7_unified_platform_v1';

export const COINS_PER_10_EGP = 78;
export const EGP_PER_COIN = Number((10 / 78).toFixed(3)); // ~0.128 EGP

const INITIAL_PLATFORM_LEVELS: PlatformLevelInfo[] = [
  {
    id: 'book',
    name: 'الكتاب',
    levelLabel: 'قارئ فضي',
    levelNumber: 4,
    xp: 420,
    colorHex: '#6D4C24',
    badgeBgClass: 'bg-[#6D4C24]/15 border-[#6D4C24]/40',
    textClass: 'text-[#6D4C24]',
  },
  {
    id: 'souq',
    name: 'السوق',
    levelLabel: 'مستوى 5',
    levelNumber: 5,
    xp: 510,
    colorHex: '#2563EB',
    badgeBgClass: 'bg-blue-600/15 border-blue-600/40',
    textClass: 'text-blue-700',
  },
  {
    id: 'audio',
    name: 'مشغل الصوت',
    levelLabel: 'مستوى 3',
    levelNumber: 3,
    xp: 310,
    colorHex: '#7C3AED',
    badgeBgClass: 'bg-purple-600/15 border-purple-600/40',
    textClass: 'text-purple-700',
  },
  {
    id: 'mdlearn',
    name: 'MD Learn',
    levelLabel: 'مستوى 4',
    levelNumber: 4,
    xp: 400,
    colorHex: '#B45309',
    badgeBgClass: 'bg-amber-700/15 border-amber-700/40',
    textClass: 'text-amber-800',
  },
  {
    id: 'md6',
    name: 'MD6',
    levelLabel: 'مستوى 2',
    levelNumber: 2,
    xp: 220,
    colorHex: '#059669',
    badgeBgClass: 'bg-emerald-600/15 border-emerald-600/40',
    textClass: 'text-emerald-700',
  },
  {
    id: 'md7',
    name: 'MD7',
    levelLabel: 'المرتبة 7 - متقدم',
    levelNumber: 7,
    xp: 700,
    colorHex: '#D4AF37',
    badgeBgClass: 'bg-[#D4AF37]/20 border-[#C59B49]/60',
    textClass: 'text-[#8C6418]',
  },
];

const INITIAL_SUPPORTERS: SupporterEntry[] = [
  { id: 'sup-1', name: 'م. فيصل الشمري', totalCoins: 45, lastGift: 9, lastTimestamp: 'منذ 12 دقيقة' },
  { id: 'sup-2', name: 'د. طارق المنصوري', totalCoins: 27, lastGift: 9, lastTimestamp: 'منذ 35 دقيقة' },
  { id: 'sup-3', name: 'ليلى الهاشمي', totalCoins: 18, lastGift: 6, lastTimestamp: 'منذ ساعة' },
  { id: 'sup-4', name: 'يوسف المنشاوي', totalCoins: 9, lastGift: 3, lastTimestamp: 'منذ ساعتين' },
];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-init-1',
    type: 'reserve_coin',
    platform: 'md7',
    title: 'رصيد مركزي ابتدائي موحد (10.00 ج.م)',
    coinsDelta: 78,
    egpAmount: 10.0,
    pointsDelta: 0,
    timestamp: 'الرصيد المعتمد',
    status: 'مكتمل',
  },
];

interface PersistedState {
  account: PlatformAccountProfile;
  coins: number;
  progressPoints: number;
  transactionsCount: number;
  transactions: WalletTransaction[];
  platformLevels: PlatformLevelInfo[];
  supporters: SupporterEntry[];
  books: PlatformBookItem[];
  purchasedBookIds: string[];
  reviews: ReaderReview[];
}

interface UnifiedPlatformContextValue extends PersistedState {
  connectedPlatformsCount: number;
  centralRankNumber: number;
  centralRankTitle: string;
  egpEquivalent: string;
  liveGiftEvent: LiveGiftEvent | null;
  dismissLiveGift: () => void;
  signInAsRole: (name: string, role: UserRole) => void;
  toggleDayNight: () => void;
  isNightWeather: boolean;
  reserveCoins: (coins: number, sourcePlatform?: PlatformId) => { success: boolean; message: string };
  submitPaymentRequest: (egpAmount: number, sourcePlatform?: PlatformId) => { success: boolean; coinsAdded: number; message: string };
  calculateCoinsForEgp: (egp: number) => number;
  calculateEgpForCoins: (coins: number) => number;
  purchaseBook: (bookId: string) => { success: boolean; message: string };
  sendGift: (coins: 3 | 6 | 9, targetLabel?: string, platform?: PlatformId) => { success: boolean; message: string };
  publishNewBook: (title: string, author: string, description: string, priceCoins: number, category: string, contentText?: string) => PlatformBookItem;
  addReview: (bookId: string, name: string, rating: number, comment: string) => void;
}

const UnifiedPlatformContext = createContext<UnifiedPlatformContextValue | null>(null);

function computeRank(levels: PlatformLevelInfo[]): { rankNumber: number; rankTitle: string } {
  const sum = levels.reduce((acc, l) => acc + l.levelNumber, 0);
  const rankNumber = Math.max(7, Math.floor(sum / 3));
  const rankTitle = rankNumber >= 12 ? 'خبير المنظومة' : rankNumber >= 9 ? 'نخبة متقدمة' : 'متقدم';
  return { rankNumber, rankTitle };
}

export const UnifiedPlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNightWeather, setIsNightWeather] = useState(false);
  const [liveGiftEvent, setLiveGiftEvent] = useState<LiveGiftEvent | null>(null);

  const [state, setState] = useState<PersistedState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        return {
          account: parsed.account || { name: 'أحمد', role: 'reader', isSignedIn: false, city: 'القاهرة' },
          coins: typeof parsed.coins === 'number' ? parsed.coins : 78,
          progressPoints: typeof parsed.progressPoints === 'number' ? parsed.progressPoints : 100,
          transactionsCount: typeof parsed.transactionsCount === 'number' ? parsed.transactionsCount : 12,
          transactions: Array.isArray(parsed.transactions) && parsed.transactions.length > 0 ? parsed.transactions : INITIAL_TRANSACTIONS,
          platformLevels: Array.isArray(parsed.platformLevels) && parsed.platformLevels.length === 6 ? parsed.platformLevels : INITIAL_PLATFORM_LEVELS,
          supporters: Array.isArray(parsed.supporters) && parsed.supporters.length > 0 ? parsed.supporters : INITIAL_SUPPORTERS,
          books: Array.isArray(parsed.books) && parsed.books.length > 0 ? parsed.books : BUILT_IN_BOOKS,
          purchasedBookIds: Array.isArray(parsed.purchasedBookIds) ? parsed.purchasedBookIds : [],
          reviews: Array.isArray(parsed.reviews) && parsed.reviews.length > 0 ? parsed.reviews : INITIAL_REVIEWS,
        };
      }
    } catch {
      // fallback to defaults
    }
    return {
      account: { name: 'أحمد', role: 'reader', isSignedIn: false, city: 'القاهرة' },
      coins: 78,
      progressPoints: 100,
      transactionsCount: 12,
      transactions: INITIAL_TRANSACTIONS,
      platformLevels: INITIAL_PLATFORM_LEVELS,
      supporters: INITIAL_SUPPORTERS,
      books: BUILT_IN_BOOKS,
      purchasedBookIds: [],
      reviews: INITIAL_REVIEWS,
    };
  });

  const { rankNumber: centralRankNumber, rankTitle: centralRankTitle } = computeRank(state.platformLevels);

  // Persist locally + sync key wallet metrics to Express backend
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota error
    }

    fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coins: state.coins,
        progressPoints: state.progressPoints,
        transactionsCount: state.transactionsCount,
        rankNumber: centralRankNumber,
        rankTitle: centralRankTitle,
      }),
    }).catch(() => {
      // silent offline fallback
    });
  }, [state, centralRankNumber, centralRankTitle]);

  const calculateCoinsForEgp = useCallback((egp: number): number => {
    if (!Number.isFinite(egp) || egp <= 0) return 0;
    return Math.round((egp / 10) * 78);
  }, []);

  const calculateEgpForCoins = useCallback((coins: number): number => {
    if (!Number.isFinite(coins) || coins <= 0) return 0;
    return Number(((coins / 78) * 10).toFixed(2));
  }, []);

  const bumpPlatformXp = (levels: PlatformLevelInfo[], target: PlatformId, xpGain: number, userRole?: UserRole): PlatformLevelInfo[] => {
    return levels.map((lvl) => {
      if (lvl.id !== target) return lvl;
      const newXp = lvl.xp + xpGain;
      const newLevelNum = lvl.levelNumber + (newXp >= (lvl.levelNumber + 1) * 120 ? 1 : 0);
      let newLabel = lvl.levelLabel;
      if (lvl.id === 'book') {
        const prefix = userRole === 'publisher' ? 'ناشر' : 'قارئ';
        newLabel = newLevelNum >= 6 ? `${prefix} ذهبي` : `${prefix} فضي`;
      } else if (lvl.id !== 'md7') {
        newLabel = `مستوى ${newLevelNum}`;
      }
      return { ...lvl, xp: newXp, levelNumber: newLevelNum, levelLabel: newLabel };
    });
  };

  const signInAsRole = useCallback((name: string, role: UserRole) => {
    const cleanName = name.trim() || (role === 'publisher' ? 'ناشر جديد' : 'قارئ جديد');
    setState((prev) => ({
      ...prev,
      account: { ...prev.account, name: cleanName, role, isSignedIn: true },
      platformLevels: prev.platformLevels.map((l) =>
        l.id === 'book'
          ? {
              ...l,
              levelLabel: role === 'publisher' ? 'ناشر فضي' : 'قارئ فضي',
            }
          : l
      ),
    }));
    audioEngine.playGoldenChime();
  }, []);

  const toggleDayNight = useCallback(() => {
    setIsNightWeather((prev) => !prev);
  }, []);

  const reserveCoins = useCallback(
    (coins: number, sourcePlatform: PlatformId = 'book') => {
      const amount = Math.floor(coins);
      if (amount <= 0) {
        return { success: false, message: 'اختر عدداً صحيحاً من العملات.' };
      }
      const egp = calculateEgpForCoins(amount);
      const tx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'reserve_coin',
        platform: sourcePlatform,
        title: `حجز وشراء ${amount} عملة مركزية عبر ${sourcePlatform === 'souq' ? 'السوق' : sourcePlatform === 'mdlearn' ? 'MD Learn' : 'الكتاب'}`,
        coinsDelta: amount,
        egpAmount: egp,
        pointsDelta: 0,
        timestamp: 'الآن',
        status: 'مكتمل',
      };
      setState((prev) => ({
        ...prev,
        coins: prev.coins + amount,
        transactionsCount: prev.transactionsCount + 1,
        transactions: [tx, ...prev.transactions],
        platformLevels: bumpPlatformXp(prev.platformLevels, sourcePlatform, 35, prev.account.role),
      }));
      audioEngine.playGoldenChime();
      return {
        success: true,
        message: `تمت إضافة ${amount} عملة (${egp.toFixed(2)} ج.م) إلى رصيدك المركزي الموحد لجميع المنصات الستة.`,
      };
    },
    [calculateEgpForCoins]
  );

  const submitPaymentRequest = useCallback(
    (egpAmount: number, sourcePlatform: PlatformId = 'book') => {
      if (!Number.isFinite(egpAmount) || egpAmount <= 0) {
        return { success: false, coinsAdded: 0, message: 'أدخل مبلغاً صحيحاً بالجنيه المصري.' };
      }
      const coinsAdded = calculateCoinsForEgp(egpAmount);
      const tx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'payment_request',
        platform: sourcePlatform,
        title: `طلب دفع مؤكد (${egpAmount.toFixed(2)} ج.م → +${coinsAdded} عملة)`,
        coinsDelta: coinsAdded,
        egpAmount,
        pointsDelta: 0,
        timestamp: 'الآن',
        status: 'مكتمل',
      };
      setState((prev) => ({
        ...prev,
        coins: prev.coins + coinsAdded,
        transactionsCount: prev.transactionsCount + 1,
        transactions: [tx, ...prev.transactions],
        platformLevels: bumpPlatformXp(prev.platformLevels, sourcePlatform, 45, prev.account.role),
      }));
      audioEngine.playGoldenChime();
      return {
        success: true,
        coinsAdded,
        message: `تم تأكيد طلب الدفع (${egpAmount.toFixed(2)} ج.م) وإضافة ${coinsAdded} عملة إلى محفظتك المركزية.`,
      };
    },
    [calculateCoinsForEgp]
  );

  const purchaseBook = useCallback(
    (bookId: string) => {
      const targetBook = state.books.find((b) => b.id === bookId);
      if (!targetBook) {
        return { success: false, message: 'الكتاب غير موجود في المنصة.' };
      }
      if (state.purchasedBookIds.includes(bookId)) {
        return { success: true, message: `لديك «${targetBook.title}» بالفعل ويمكنك قراءته الآن.` };
      }
      if (state.coins < targetBook.priceCoins) {
        return {
          success: false,
          message: `رصيدك المركزي الحالي (${state.coins} عملة) أقل من سعر الكتاب (${targetBook.priceCoins} عملة). اشحن رصيدك من الكارت المركزي.`,
        };
      }
      const tx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'purchase_book',
        platform: 'book',
        title: `شراء «${targetBook.title}» (${targetBook.priceCoins} عملة)`,
        coinsDelta: -targetBook.priceCoins,
        pointsDelta: 0,
        timestamp: 'الآن',
        status: 'مكتمل',
      };
      setState((prev) => ({
        ...prev,
        coins: prev.coins - targetBook.priceCoins,
        transactionsCount: prev.transactionsCount + 1,
        transactions: [tx, ...prev.transactions],
        purchasedBookIds: [...prev.purchasedBookIds, bookId],
        books: prev.books.map((b) => (b.id === bookId ? { ...b, salesCount: b.salesCount + 1 } : b)),
        platformLevels: bumpPlatformXp(prev.platformLevels, 'book', 60, prev.account.role),
      }));
      audioEngine.playGoldenChime();
      return {
        success: true,
        message: `تم شراء «${targetBook.title}» بنجاح (${targetBook.priceCoins} عملة من الرصيد المركزي).`,
      };
    },
    [state.books, state.coins, state.purchasedBookIds]
  );

  const sendGift = useCallback(
    (coins: 3 | 6 | 9, targetLabel = 'المؤلف والناشر', platform: PlatformId = 'book') => {
      if (state.coins < coins) {
        return {
          success: false,
          message: `رصيدك المركزي (${state.coins} عملة) غير كافٍ لإرسال هدية ${coins} عملات.`,
        };
      }
      const supporterName = state.account.name || 'قارئ داعم';
      const tx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'send_gift',
        platform,
        title: `هدية بث مباشر (${coins} عملات → ${targetLabel}) · بدون عمولة`,
        coinsDelta: -coins,
        pointsDelta: 0,
        timestamp: 'الآن',
        status: 'مكتمل',
      };
      setState((prev) => {
        const existingIdx = prev.supporters.findIndex((s) => s.name === supporterName);
        let updatedSupporters: SupporterEntry[];
        if (existingIdx >= 0) {
          updatedSupporters = prev.supporters.map((s, idx) =>
            idx === existingIdx
              ? { ...s, totalCoins: s.totalCoins + coins, lastGift: coins, lastTimestamp: 'الآن' }
              : s
          );
        } else {
          updatedSupporters = [
            ...prev.supporters,
            { id: `sup-${Date.now()}`, name: supporterName, totalCoins: coins, lastGift: coins, lastTimestamp: 'الآن' },
          ];
        }
        updatedSupporters.sort((a, b) => b.totalCoins - a.totalCoins);

        return {
          ...prev,
          coins: prev.coins - coins,
          transactionsCount: prev.transactionsCount + 1,
          transactions: [tx, ...prev.transactions],
          supporters: updatedSupporters,
          platformLevels: bumpPlatformXp(prev.platformLevels, platform, 30, prev.account.role),
        };
      });

      const evt: LiveGiftEvent = {
        id: `gift-${Date.now()}`,
        supporterName,
        coins,
        timestamp: Date.now(),
      };
      setLiveGiftEvent(evt);
      audioEngine.playGoldenChime();

      return {
        success: true,
        message: `تم إرسال هدية ${coins} عملات بالكامل (بدون عمولة).`,
      };
    },
    [state.coins, state.account.name]
  );

  const dismissLiveGift = useCallback(() => {
    setLiveGiftEvent(null);
  }, []);

  useEffect(() => {
    if (!liveGiftEvent) return;
    const t = setTimeout(() => setLiveGiftEvent(null), 5000);
    return () => clearTimeout(t);
  }, [liveGiftEvent]);

  const publishNewBook = useCallback(
    (title: string, author: string, description: string, priceCoins: number, category: string, contentText?: string) => {
      const newBook: PlatformBookItem = {
        id: `book-${Date.now()}`,
        title: title.trim() || 'كتاب جديد',
        author: author.trim() || state.account.name || 'ناشر معتمد',
        description: description.trim() || 'إصدار رقمي جديد داخل منصة الكتاب.',
        cover: '/books/noon/images/calm_backdrop.jpg',
        priceCoins: Math.max(3, Math.floor(priceCoins || 30)),
        category: category.trim() || 'معرفة وفكر',
        isFeatured: true,
        salesCount: 0,
        chaptersText: contentText ? contentText.split(/\n{2,}/).filter(Boolean) : undefined,
      };
      setState((prev) => ({
        ...prev,
        books: [newBook, ...prev.books],
        platformLevels: bumpPlatformXp(prev.platformLevels, 'book', 80, 'publisher'),
      }));
      audioEngine.playGoldenChime();
      return newBook;
    },
    [state.account.name]
  );

  const addReview = useCallback((bookId: string, name: string, rating: number, comment: string) => {
    const newRev: ReaderReview = {
      id: `rev-${Date.now()}`,
      bookId,
      name: name.trim() || 'قارئ منصة الكتاب',
      rating,
      comment: comment.trim(),
      timestamp: 'الآن',
      isVerified: true,
    };
    setState((prev) => ({
      ...prev,
      reviews: [newRev, ...prev.reviews],
      platformLevels: bumpPlatformXp(prev.platformLevels, 'book', 20, prev.account.role),
    }));
    audioEngine.playGoldenChime();
  }, []);

  return (
    <UnifiedPlatformContext.Provider
      value={{
        ...state,
        connectedPlatformsCount: 6,
        centralRankNumber,
        centralRankTitle,
        egpEquivalent: ((state.coins / 78) * 10).toFixed(2),
        liveGiftEvent,
        dismissLiveGift,
        signInAsRole,
        toggleDayNight,
        isNightWeather,
        reserveCoins,
        submitPaymentRequest,
        calculateCoinsForEgp,
        calculateEgpForCoins,
        purchaseBook,
        sendGift,
        publishNewBook,
        addReview,
      }}
    >
      {children}
    </UnifiedPlatformContext.Provider>
  );
};

export function useUnifiedPlatform() {
  const ctx = useContext(UnifiedPlatformContext);
  if (!ctx) {
    throw new Error('useUnifiedPlatform must be used within UnifiedPlatformProvider');
  }
  return ctx;
}

export interface BookPage {
  id: number;
  pageNumber: number;
  chapter?: string;
  partId?: string;
  partTitle?: string;
  displayNumber?: string;
  title: string;
  subtitle?: string;
  content: string[];
  quote?: string;
  quotes?: string[];
  image?: string;
  imagePrompt?: string;
  imageCaption?: string;
  noteUnderImage?: string;
  specs?: { label: string; value: string }[];
  sourcePages?: string;
  sourceWordCount?: number;
  copiedWordCount?: number;
  isAlternateVersion?: boolean;
  kind?: string;
  isFrontCover?: boolean;
  isBackCover?: boolean;
  isGlossary?: boolean;
}

export interface ReadingProgress {
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  lastReadDate: string;
  isCompleted: boolean;
}

export interface ReaderReview {
  id: string;
  bookId?: string;
  name: string;
  rating: number;
  comment: string;
  timestamp: string;
  isVerified?: boolean;
  avatarSeed?: string;
}

export type UserRole = 'reader' | 'publisher';

export interface PlatformAccountProfile {
  name: string;
  role: UserRole;
  isSignedIn: boolean;
  city: string;
}

export type PlatformId = 'md7' | 'souq' | 'book' | 'audio' | 'mdlearn' | 'md6';

export interface PlatformLevelInfo {
  id: PlatformId;
  name: string;
  levelLabel: string;
  levelNumber: number;
  xp: number;
  colorHex: string;
  badgeBgClass: string;
  textClass: string;
}

export interface WalletTransaction {
  id: string;
  type: 'reserve_coin' | 'payment_request' | 'purchase_book' | 'send_gift' | 'publisher_earning';
  platform: PlatformId;
  title: string;
  coinsDelta: number;
  egpAmount?: number;
  pointsDelta: number;
  timestamp: string;
  status: 'مكتمل' | 'قيد التأكيد';
}

export interface SupporterEntry {
  id: string;
  name: string;
  totalCoins: number;
  lastGift: 3 | 6 | 9;
  lastTimestamp: string;
}

export interface PlatformBookItem {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  priceCoins: number;
  category: string;
  isFeatured?: boolean;
  isBuiltInNoon?: boolean;
  launchDate?: string;
  salesCount: number;
  chaptersText?: string[];
}

export interface LiveGiftEvent {
  id: string;
  supporterName: string;
  coins: 3 | 6 | 9;
  timestamp: number;
}

export interface ChapterDeletionEntry {
  chapterTitle?: string;
  sourcePage: string;
  deletedWordCount: number;
  reason: string;
}

export interface ChapterJSON {
  id: string;
  partId: string;
  partTitle: string;
  order: number;
  displayNumber: string;
  title: string;
  subtitle?: string;
  author: string;
  sourcePages: string;
  sourceWordCount: number;
  copiedWordCount: number;
  status: string;
  isAlternateVersion: boolean;
  kind: string;
  image?: string;
  imagePrompt?: string;
  noteUnderImage?: string;
  quotes?: string[];
  deletions?: ChapterDeletionEntry[];
  paragraphs: string[];
}

export interface BookManifest {
  id: string;
  title: string;
  author: string;
  cover: string;
  coverRatio?: string;
  language: string;
  description: string;
  launchDate?: string;
  parts: { id: string; title: string }[];
  chapters: {
    id: string;
    file: string;
    partId: string;
    partTitle: string;
    order: number;
    displayNumber: string;
    title: string;
    subtitle?: string;
    sourcePages: string;
    sourceWordCount: number;
    copiedWordCount: number;
    status: string;
    isAlternateVersion: boolean;
    kind: string;
  }[];
  auditSummary: {
    totalSourcePdfPages: number;
    blankPdfPages: number[];
    duplicatePdfPagesOmitted: string;
    totalChaptersGenerated: number;
    totalMainChapters: number;
    totalAlternateVersions: number;
    totalSourceWordsInChapters: number;
    totalCopiedWordsInChapters: number;
  };
  deletionsLog: ChapterDeletionEntry[];
  quotesAndVerses: {
    chapterTitle: string;
    sourcePages: string;
    quote: string;
  }[];
}

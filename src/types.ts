export interface BookPage {
  id: number;
  pageNumber: number;
  chapter?: string;
  title: string;
  subtitle?: string;
  content: string[];
  quote?: string;
  image?: string;
  imageCaption?: string;
  specs?: { label: string; value: string }[];
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
  name: string;
  rating: number;
  comment: string;
  timestamp: string;
  isVerified?: boolean;
  avatarSeed?: string;
}

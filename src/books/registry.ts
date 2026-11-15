import noonManifestRaw from './noon/manifest.json';
import { BookManifest, ChapterJSON, PlatformBookItem } from '../types';
import { EXHIBITION_CONFIG } from '../exhibition.config';

const chapterModules = import.meta.glob('./noon/chapters/*.json', { eager: true }) as Record<
  string,
  { default: ChapterJSON } | ChapterJSON
>;

function unwrapChapter(mod: { default: ChapterJSON } | ChapterJSON): ChapterJSON {
  return 'default' in mod ? mod.default : mod;
}

export const NOON_MANIFEST: BookManifest = noonManifestRaw as BookManifest;

export function getBookChapters(bookId: string, includeAlternates = EXHIBITION_CONFIG.SHOW_ALTERNATE_VERSIONS): ChapterJSON[] {
  if (bookId !== 'noon') return [];
  return NOON_MANIFEST.chapters
    .filter((entry) => includeAlternates || !entry.isAlternateVersion)
    .map((entry) => {
      const mod = chapterModules[`./noon/chapters/${entry.file}`];
      if (!mod) return null;
      return unwrapChapter(mod);
    })
    .filter((c): c is ChapterJSON => c !== null);
}

export function getBookManifest(bookId: string): BookManifest | null {
  if (bookId === 'noon') return NOON_MANIFEST;
  return null;
}

export const BUILT_IN_BOOKS: PlatformBookItem[] = [
  {
    id: 'noon',
    title: 'كتاب نون',
    author: 'محمد الهمام',
    description: 'النسخة الكاملة غير المختصرة: رحلة المعرفة وكشف الحقائق، والوعي والأسئلة الفلسفية، والقصص والأفكار.',
    cover: '/books/noon/cover.png',
    priceCoins: 78,
    category: 'فلسفة ومعرفة',
    isFeatured: true,
    isBuiltInNoon: true,
    salesCount: 14,
  },
];

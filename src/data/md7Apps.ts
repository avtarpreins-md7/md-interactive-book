export interface MD7App {
  id: string;
  name: string;
  nameEn: string;
  url: string;
  category: string;
  description: string;
  tag: string;
  badge: string;
  iconType: 'studio' | 'currency' | 'portal';
}

export const MD7_APPS: MD7App[] = [
  {
    id: 'md7-ai-studio',
    name: 'منصة مجموعة MD7 الرئيسية',
    nameEn: 'MD7 Group AI Studio Hub',
    url: 'https://md7-group.ai.studio/',
    category: 'المنصة السحابية والذكاء الاصطناعي',
    description: 'البوابة التفاعلية الشاملة والمقر السحابي لمجموعة وتطبيقات ومشاريع MD7.',
    tag: 'المركز الرئيسي',
    badge: 'AI STUDIO HUB',
    iconType: 'studio'
  },
  {
    id: 'md7-currency',
    name: 'منظومة MD للعملات والأسواق',
    nameEn: 'MD Currency Exchange',
    url: 'https://avtarpreins-md7.github.io/Md_currency.-html/',
    category: 'التقنية المالية والأسواق',
    description: 'تطبيق متقدم لمتابعة أسعار صرف العملات العالمية والتحويل الفوري مع تحليلات مالية دقيقة.',
    tag: 'تطبيق مالي',
    badge: 'CURRENCY APP',
    iconType: 'currency'
  },
  {
    id: 'md7-portal',
    name: 'موقع MD-7 الرسمي',
    nameEn: 'MD-7 Official Portal',
    url: 'https://md-7-site.vercel.app',
    category: 'البوابة المؤسسية',
    description: 'الموقع الرسمي السريع والحديث لصروح وخدمات واستثمارات مجموعة MD7 عبر منصة Vercel.',
    tag: 'البوابة الرسمية',
    badge: 'OFFICIAL PORTAL',
    iconType: 'portal'
  }
];

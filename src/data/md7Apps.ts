export interface MD7App {
  id: string;
  name: string;
  nameEn: string;
  url: string;
  category: string;
  description: string;
  tag: string;
  badge: string;
  sphereLabel: string;
  colorName: string;
  colorHex: string;
  glowRgba: string;
  gradientClass: string;
  borderClass: string;
  iconType: 'music' | 'currency' | 'book' | 'souq' | 'studio';
}

export const MD7_HUB_URL = 'https://md7-group.ai.studio/';

export const MD7_APPS: MD7App[] = [
  {
    id: 'md3-musician',
    name: 'MD3 للموسيقى والصوتيات',
    nameEn: 'MD3 Musician',
    url: 'https://md3-musician.vercel.app/',
    category: 'الموسيقى والتجربة الصوتية',
    description: 'منصة الاستماع والإنتاج الموسيقي التابعة للمنظومة، تمنحك أجواءً صوتية مرافقة للقراءة والتأمل.',
    tag: 'الدائرة البنفسجية',
    badge: 'PURPLE SPHERE · MD3',
    sphereLabel: 'MD3',
    colorName: 'البنفسجي',
    colorHex: '#8B5CF6',
    glowRgba: 'rgba(139, 92, 246, 0.55)',
    gradientClass: 'from-violet-500 via-purple-600 to-indigo-900',
    borderClass: 'border-violet-400',
    iconType: 'music',
  },
  {
    id: 'md-currency',
    name: 'MD للعملات والأسواق',
    nameEn: 'MD Currency',
    url: 'https://avtarpreins-md7.github.io/md-currency/',
    category: 'التقنية المالية والعملات',
    description: 'تطبيق متابعة أسعار العملات العالمية والتحويل الفوري والمؤشرات الاقتصادية بدقة عالية.',
    tag: 'الدائرة الخضراء',
    badge: 'GREEN SPHERE · MD CURRENCY',
    sphereLabel: 'MD$',
    colorName: 'الأخضر',
    colorHex: '#10B981',
    glowRgba: 'rgba(16, 185, 129, 0.5)',
    gradientClass: 'from-emerald-400 via-green-600 to-teal-950',
    borderClass: 'border-emerald-400',
    iconType: 'currency',
  },
  {
    id: 'md-book-experience',
    name: 'تجربة الكتب التفاعلية (معرض MD7)',
    nameEn: 'MD Interactive Book Experience',
    url: 'https://md-interactive-book-experience.ai.studio/',
    category: 'المعرض والكتب التفاعلية',
    description: 'المنصة السينمائية التفاعلية لقراءة وتصفح كتاب «نون» وإصدارات المعرض بتقنية رقمية فاخرة.',
    tag: 'الدائرة البنية',
    badge: 'BROWN SPHERE · BOOK HUB',
    sphereLabel: 'MD2',
    colorName: 'البني',
    colorHex: '#8C5D30',
    glowRgba: 'rgba(140, 93, 48, 0.6)',
    gradientClass: 'from-[#A4713E] via-[#6D4C24] to-[#2F1D0A]',
    borderClass: 'border-amber-600',
    iconType: 'book',
  },
  {
    id: 'md-souq',
    name: 'MD Souq للسوق الرقمي',
    nameEn: 'MD Souq',
    url: 'https://md-souq.vercel.app/',
    category: 'السوق والخدمات الذكية',
    description: 'بوابة التسوق والعروض والمنتجات الرقمية المتكاملة ضمن منظومة تطبيقات MD7.',
    tag: 'الدائرة الزرقاء',
    badge: 'BLUE SPHERE · MD SOUQ',
    sphereLabel: 'SOUQ',
    colorName: 'الأزرق',
    colorHex: '#3B82F6',
    glowRgba: 'rgba(59, 130, 246, 0.55)',
    gradientClass: 'from-sky-400 via-blue-600 to-slate-900',
    borderClass: 'border-sky-400',
    iconType: 'souq',
  },
];

export const MD7_HUB_APP: MD7App = {
  id: 'md7-group-hub',
  name: 'منصة مجموعة MD7 الرئيسية',
  nameEn: 'MD7 Group AI Studio Hub',
  url: MD7_HUB_URL,
  category: 'البوابة المركزية الموحدة',
  description: 'المركز السحابي الموحد والرابط الرئيسي لرمز QR الذي يجمع كافة الدوائر الملونة والتطبيقات.',
  tag: 'المركز الرئيسي · QR',
  badge: 'CENTRAL QR HUB',
  sphereLabel: 'MD7',
  colorName: 'الذهبي',
  colorHex: '#D4AF37',
  glowRgba: 'rgba(212, 175, 55, 0.55)',
  gradientClass: 'from-amber-300 via-yellow-500 to-amber-800',
  borderClass: 'border-amber-400',
  iconType: 'studio',
};

export const CHROME_INSTALL_STEPS = [
  'افتح كاميرا الهاتف وامسح رمز الاستجابة السريعة (QR Code) المتجه إلى: https://md7-group.ai.studio/',
  'ستفتح لك الواجهة المركزية وبها أربع دوائر ملونة (البنفسجي، الأخضر، البني، والأزرق)؛ اضغط على أي دائرة لفتح التطبيق الخاص بها.',
  'لإضافة التطبيق إلى شاشة هاتفك الرئيسية: اضغط على أيقونة الثلاث نقاط (⋮) الموجودة في يسار أو أعلى متصفح Google Chrome.',
  'اختر «الإضافة إلى الشاشة الرئيسية» (Add to Home screen) ثم اضغط «إضافة» ليظهر التطبيق كأيقونة مستقلة على هاتفك.',
];

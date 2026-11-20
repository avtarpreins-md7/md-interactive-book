import { ExhibitionBook, BookPaymentReceivingInfo } from '../types';
import { NOON_MANIFEST, getBookChapters } from '../books/registry';

export const DEFAULT_PAYMENT_RECEIVING_INFO: BookPaymentReceivingInfo = {
  walletNumber: '01000000000',
  instapayAddress: 'mdbooks@instapay',
  bankAccountInfo: 'البنك الأهلي المصري — حساب: 12345678901234',
  externalPlatformName: 'منصة الدفع المباشر',
  externalPlatformUrl: 'https://pay.md-exhibition.example/checkout',
};

function buildNoonSamplePages(): string[] {
  const chapters = getBookChapters('noon', false);
  const pages: string[] = [];
  for (const ch of chapters) {
    const joined = [ch.title, ...ch.paragraphs.slice(0, 3)].join('\n\n');
    pages.push(joined);
    if (pages.length >= 15) break;
  }
  return pages.length > 0 ? pages : [NOON_MANIFEST.description];
}

export const INITIAL_EXHIBITION_BOOKS: ExhibitionBook[] = [
  {
    id: 'noon',
    title: 'كتاب نون',
    author: 'محمد الهمام',
    description:
      'النسخة الكاملة المحفوظة للمؤلف فقط — غير متاحة للعرض العام وتُفتح حصرياً بدخول المؤلف الخاص.',
    cover: '/books/noon/cover.png',
    rating: 4.9,
    ratingsCount: 142,
    pageCount: 120,
    isFreeShowcase: false,
    priceEgp: 0,
    category: 'إصدار خاص بالمؤلف',
    isBuiltInNoon: true,
    isAuthorLocked: true,
    samplePages: buildNoonSamplePages(),
  },
  {
    id: 'showcase-free-noon-intro',
    title: 'المدخل إلى خيال المعرفة (عرض مجاني)',
    author: 'محمد الهمام',
    description:
      'إصدار مجاني متاح للجميع داخل المعرض: يفتح بوابات التفكير النقدي والتمييز بين المعرفة الظاهرة والحقيقة العميقة، ويوضح كيفية تحويل الفكرة إلى أثر نافع.',
    cover: '/books/noon/images/chapter1.jpg',
    rating: 4.8,
    ratingsCount: 86,
    pageCount: 24,
    isFreeShowcase: true,
    priceEgp: 0,
    category: 'عرض مجاني',
    samplePages: [
      'لماذا نبدأ بالسؤال؟ السؤال الصادق هو المفتاح الأول لكل طريق طويل.',
      'الإنسان لا يعيش بما يراه فقط، بل بما يفهمه ويمنحه قيمة ومعنى.',
      'الفرق بين المعلومة المعلبة والمعرفة الحية هو القدرة على الاختبار والتفكير.',
      'حين تراقب التفاصيل اليومية بعين الباحث تكتشف أن لكل حدث خيطاً يربطه بغيره.',
      'الخيال العلمي والفلسفي ليس هروباً من الواقع، بل مختبر لتجربة الاحتمالات.',
      'كل صرح عظيم بدأ بفكرة صغيرة وُضعت تحت نور الانضباط والعمل.',
      'الكتابة هي الوعاء الذي يحفظ التجربة من التبدد ويمنحها أجنحة تعبر الزمن.',
      'في هذا العرض المجاني تتلمس الخطوط الأولى لمنهجية الوعي وبناء الأثر.',
      'القراءة المتأنية تفتح مسارات عصبية وفكرية لم تكن منتبهة قبل الصفحة الأولى.',
      'استمر في القراءة لتصل إلى الصياغة العملية التي تنقل الفكرة إلى تطبيق.',
      'صفحة ١١ — استكمال العرض المجاني: نحو خارطة بناء المشروع الرقمي.',
      'صفحة ١٢ — خاتمة النموذج المجاني وإهداء للقارئ المتأمل.',
    ],
  },
  {
    id: 'mirrors-order',
    title: 'عالم الانعكاسات والنظام',
    author: 'طارق المنصوري',
    description:
      'دراسة تحليلية في التناظر المعماري والفكري، وقصة الإنسان حين يقف أمام المرايا المتقابلة ليكتشف أن الترتيب الخارجي مرآة للنظام الداخلي.',
    cover: '/books/noon/images/chapter2.jpg',
    rating: 4.7,
    ratingsCount: 64,
    pageCount: 96,
    isFreeShowcase: false,
    priceEgp: 75,
    category: 'فكر وعمارة',
    acceptedMethods: ['wallet', 'instapay', 'bank', 'external_platform'],
    paymentInfo: DEFAULT_PAYMENT_RECEIVING_INFO,
    samplePages: Array.from({ length: 14 }, (_, i) =>
      `الباب ${i + 1} — عالم الانعكاسات والنظام:\n\nيتأمل هذا القسم في القوانين الدقيقة التي تحكم حركة الأنماط المتكررة في الطبيعة والعمارة والوعي البشري، وكيف يلتقط العقل الإشارات الهندسية في التفاصيل الصامتة.`
    ),
  },
  {
    id: 'golden-path-7',
    title: 'طريق المستقبل والضوء: سر الرقم 7',
    author: 'فيصل الشمري',
    description:
      'قراءة علمية وتاريخية في حضور الرقم سبعة عبر الزمن والدورات الحضارية، والتحولات الكبرى بين الأعوام المتعاقبة ومسؤولية البناء الواعي.',
    cover: '/books/noon/images/chapter3.jpg',
    rating: 4.8,
    ratingsCount: 53,
    pageCount: 112,
    isFreeShowcase: false,
    priceEgp: 120,
    category: 'تاريخ وعلوم',
    acceptedMethods: ['wallet', 'instapay', 'bank', 'external_platform'],
    paymentInfo: DEFAULT_PAYMENT_RECEIVING_INFO,
    samplePages: Array.from({ length: 14 }, (_, i) =>
      `المبحث ${i + 1} — طريق المستقبل والضوء:\n\nنستعرض هنا التناغم السباعي في النغمات والطيف الضوئي والأسابيع الزمنية، وكيف تتحول المحطات التاريخية إلى نقاط انطلاق لبناء مستقبل أكثر اتزاناً.`
    ),
  },
  {
    id: 'nilam-pyramid-gate',
    title: 'هرم النيلام وبوابة الوعي الافتراضي',
    author: 'ليلى الهاشمي',
    description:
      'مشروع معماري وتقني يمزج التراث المصري العريق بتقنيات الهولوغرام والواقع الافتراضي لتقديم تجربة تعليمية وبصرية عابرة للزمن.',
    cover: '/books/noon/images/nilam.jpg',
    rating: 4.9,
    ratingsCount: 79,
    pageCount: 140,
    isFreeShowcase: false,
    priceEgp: 150,
    category: 'تكنولوجيا ومستقبل',
    acceptedMethods: ['wallet', 'instapay', 'bank', 'external_platform'],
    paymentInfo: DEFAULT_PAYMENT_RECEIVING_INFO,
    samplePages: Array.from({ length: 14 }, (_, i) =>
      `المبحث ${i + 1} — هرم النيلام:\n\nيصف هذا القسم البنية الهندسية المزدوجة للهرم الزجاجي، وآليات دمج الإضاءة الطبيعية مع العروض التفاعلية لخلق مساحة معرفة حية للزوار.`
    ),
  },
  {
    id: 'digital-corridor-ai',
    title: 'الممر الرقمي: رسالة الذكاء الاصطناعي للإنسان',
    author: 'محمد الهمام',
    description:
      'حوار هادئ ومسؤول بين الإنسان والأدوات الذكية الحديثة، يرسّخ مبدأ أن التقنية شريك ومساعد بيد العقل البشري الواعي وليست بديلاً عنه.',
    cover: '/books/noon/images/chapter4.jpg',
    rating: 4.9,
    ratingsCount: 91,
    pageCount: 84,
    isFreeShowcase: false,
    priceEgp: 95,
    category: 'ذكاء اصطناعي',
    acceptedMethods: ['wallet', 'instapay', 'bank', 'external_platform'],
    paymentInfo: DEFAULT_PAYMENT_RECEIVING_INFO,
    samplePages: Array.from({ length: 14 }, (_, i) =>
      `القسم ${i + 1} — الممر الرقمي:\n\nكيف يوجّه الإنسان الخوارزميات لصناعة كتب وتطبيقات ذات أثر نافع دون أن يفقد بصمته الروحية والأخلاقية؟ هنا تتضح ملامح الشراكة الواعية.`
    ),
  },
];

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FINAL CONFIGURATION - BOOK "NOON" («نون»)
 * Title: "نون" (Only and Final Title)
 * Author: "محمد الهمام" (Author Only)
 * Front Cover: Strictly NO "MD", "MD7", "MD Group" or logos
 * Visual Centerpiece: Crescent shaped like an open bowl/dish with golden star as dot of Noon above concentric rings
 */

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  context: string;
}

export interface ChapterStructure {
  chapterNumber: number;
  chapterTitle: string;
  imageSource?: string;
  theme: string;
  summary: string;
}

export interface BookStructureConfig {
  projectTitle: string; // "نون"
  author: string; // "محمد الهمام"
  targetLaunchCairo: string; // "2026-11-11T23:11:00+02:00"
  frontCover: {
    title: string;
    author: string;
    imageSource: string;
    visualElements: string;
    prohibitedKeywords: string[];
  };
  innerChapters: ChapterStructure[];
  glossary: GlossaryTerm[];
  backCover: {
    imageSource: string;
    title: string;
    footerText: string;
    qrUrl: string;
    nodes: {
      id: string;
      label: string;
      role: string;
      colorClass: string;
      colorHex: string;
      description: string;
    }[];
  };
}

export const BOOK_STRUCTURE_CONFIG: BookStructureConfig = {
  projectTitle: 'نون',
  author: 'محمد الهمام',
  // 11 نوفمبر 2026، الساعة 11:11 مساءً بتوقيت القاهرة (Africa/Cairo: UTC+2 => 21:11:00Z)
  targetLaunchCairo: '2026-11-11T23:11:00+02:00',
  frontCover: {
    title: 'نون',
    author: 'محمد الهمام',
    imageSource: '/src/assets/images/noon_crescent_star_cover_1794424946303.jpg',
    visualElements: 'هلال مقوس كطبق أو صحن مفتوح يمثل بدن حرف نون، تعلوه نجمة مضيئة تمثل نقطة الحرف، تحيط به حلقات مدارية كونية فوق بحر أسود مائج بانعكاسات ذهبية وإطار مذهب فاخر.',
    prohibitedKeywords: ['MD', 'MD7', 'MD Group', 'البرنس 7']
  },
  innerChapters: [
    {
      chapterNumber: 1,
      chapterTitle: 'خيال المعرفة والإلهام: رحلة البحث عن الهدف',
      imageSource: '/src/assets/images/chapter1_open_book_1794423026489.jpg',
      theme: 'صورة 2 (الكتاب المفتوح المشع بالنجوم والمجرة)',
      summary: 'لماذا جئت إلى هذا العالم؟ الإنسان بين ما يراه وما يشعر به، وبداية الطريق نحو المعنى الحقيقي للوجود.'
    },
    {
      chapterNumber: 2,
      chapterTitle: 'عالم الانعكاسات والنظام: قصة الأمير والعبور الأبدي',
      imageSource: '/src/assets/images/chapter2_infinite_mirrors_1794423042599.jpg',
      theme: 'صورة 3 (الشخص القائم وسط المرايا الممتدة)',
      summary: 'رحلة العبور من النور إلى عالم المادة، النسيان، هل نحن أبطال الحكاية، وصناعة الأثر الإنساني المستمر.'
    },
    {
      chapterNumber: 3,
      chapterTitle: 'طريق المستقبل والضوء: سر الرقم 7',
      imageSource: '/src/assets/images/chapter3_golden_street_1794423059235.jpg',
      theme: 'صورة 4 (السير في الشارع الذهبي نحو الغروب)',
      summary: 'سر الرقم سبعة في الطبيعة والتاريخ، سبع سنوات (2019-2026)، والرموز 11:11 و313 ومسؤولية العمل والقيادة.'
    },
    {
      chapterNumber: 4,
      chapterTitle: 'الممر الرقمي وتعدد المسارات: الساحر الجديد والذكاء الاصطناعي',
      imageSource: '/src/assets/images/chapter4_digital_corridor_1794423075196.jpg',
      theme: 'صورة 5 (الممر الزجاجي الطويل والشخصيات المنعكسة)',
      summary: 'الهاتف وبوابات الاتصال، رسالة الذكاء الاصطناعي للإنسان: ChatGPT, Gemini, Claude, Copilot، والشراكة المعرفية.'
    },
    {
      chapterNumber: 5,
      chapterTitle: 'تفاعل الحشود والتأمل: العالم المزدوج والديجافو والماتريكس',
      imageSource: '/src/assets/images/chapter5_mist_crowd_1794423094122.jpg',
      theme: 'صورة 6 (المرأة وسط الضباب والحشود المارة)',
      summary: 'بين عالمي وعالم الواقع، تجربة قطار طهطا والأحلام الاستباقية، الديجافو، والاستيقاظ الحقيقي من الماتريكس.'
    }
  ],
  glossary: [
    {
      term: 'نُون (Nun)',
      category: 'فلسفة وتراث كوني',
      definition: 'في الأساطير المصرية القديمة، هي المياه الأزلية الأولى التي سبقت وجود العالم المنظم ومنها انبثق أول تل بدائي يرمز للنور والحياة. وفي القرآن الكريم افتتحت بها سورة القلم: «ن والقلم وما يسطرون»، لترمز لبداية تسطير المعرفة والعلم في الوجود.',
      context: 'الفصل الأول، العاشر، والخاتمة'
    },
    {
      term: 'الديجافو (Déjà vu)',
      category: 'علم النفس وإدراك الذاكرة',
      definition: 'كلمة فرنسية تعني حرفياً «شوهد من قبل»؛ وهي ظاهرة نفسية عصبية يشعر فيها الإنسان بأن الموقف الحاضر قد عاشه أو رآه في الماضي رغم معرفته التامة بأنه يحدث للمرة الأولى، وتنشأ عن تداخل في مناطق استرجاع الذاكرة بالفص الصدغي.',
      context: 'الفصل السابع: الأحلام والديجافو'
    },
    {
      term: 'الماتريكس (The Matrix)',
      category: 'فلسفة ونظرية المعرفة',
      definition: 'استعارة فلسفية مستوحاة من محاكاة الواقع، ترمز إلى المنظومة الذهنية والاجتماعية من التصورات والأحكام المسبقة التي يعيش داخلها الإنسان ظناً أنها الحقيقة الكاملة، بينما الاستيقاظ الحقيقي هو إعمال التفكير النقدي وفحص المسلمات.',
      context: 'الفصل الثامن: الماتريكس والاستيقاظ'
    },
    {
      term: 'الجيود (Geoid)',
      category: 'علوم الأرض والفيزياء الفلكية',
      definition: 'الشكل الرياضي والفيزيائي الحقيقي لكوكب الأرض المتطابق مع سطح مستوى سطح البحر المتساوي الجهد تحت تأثير الجاذبية الأرضية ودوران الأرض، وهو شكل شبه كروي مفلطح قليلاً عند القطبين ومنتفخ عند الاستواء.',
      context: 'الفصل التاسع: هل نرى الأرض كما هي؟'
    },
    {
      term: 'الأفاتار (Avatar)',
      category: 'فلسفة الأديان الشرقية',
      definition: 'مفهوم في الفكر الهندي يعبر عن تجسد القوة الحافظة للنظام والعدالة الكونية (فيشنو) على الأرض في أوقات اضطراب القيم وتفشي الظلم لإعادة التوازن الأخلاقي والكوني.',
      context: 'الفصل الحادي عشر: المنقذ والدجال'
    },
    {
      term: 'كالكي (Kalki)',
      category: 'المعتقدات المستقبلية',
      definition: 'التجسد العاشر المنتظر في نهاية عصر «كالي يوجا» (عصر الظلام والتدهور الأخلاقي)، حيث يُرمز إليه بحصان أبيض وسيف لإنهاء مرحلة الانحلال وتدشين عصر جديد من الاستنارة.',
      context: 'الفصل الحادي عشر: فكرة الخلاص'
    },
    {
      term: 'مايتريا (Maitreya)',
      category: 'الفكر البوذي',
      definition: 'بوذا المستقبل المعلم الذي ينتظره التقليد البوذي في عصر تضعف فيه تعاليم الحكمة، ليعيد إرشاد البشر إلى طريق الاستنارة والتحرر من المعاناة بالعلم والتعليم وليس بالقوة.',
      context: 'الفصل الحادي عشر: المعلم المنتظر'
    },
    {
      term: 'الخيمياء (Alchemy)',
      category: 'تاريخ العلوم والتجربة',
      definition: 'ممارسات فلسفية ومعملية قديمة حاولت فهم طبيعة المادة وتحويل المعادن الخسيسة إلى ذهب والبحث عن إكسير الحياة، ورغم عدم دقة غاياتها إلا أنها كانت الأساس التجريبي الذي مهّد لولادة علم الكيمياء الحديث.',
      context: 'الفصل العاشر: من السحر إلى الكيمياء'
    },
    {
      term: 'الذكاء الاصطناعي التوليدي (Generative AI)',
      category: 'تكنولوجيا متقدمة',
      definition: 'أنظمة خوارزمية متطورة مدرّبة على مجموعات ضخمة من البيانات تستطيع فهم السياق وتوليد نصوص وصور وأكواد برمجية وموسيقى ومحاورة الإنسان كشريك مساعد في التفكير والإنتاج.',
      context: 'الفصل الرابع والخامس'
    },
    {
      term: 'هرم النيلام (Nilam Pyramid)',
      category: 'عمارة وتكنولوجيا افتراضية',
      definition: 'رؤية معمارية وتكنولوجية لمشروع هرم زجاجي مزدوج بجوار أهرامات الجيزة، يوظف تقنيات الواقع الافتراضي والهولوغرام والطاقة الشمسية لتقديم معايشة تفاعلية تجمع بين عظمة التراث وعوالم المستقبل.',
      context: 'الفصل الثاني عشر: هرم النيلام'
    },
    {
      term: 'رمز 313',
      category: 'تاريخ ومسؤولية مجتمعية',
      definition: 'رمزية مستوحاة من عدد المشاركين في غزوة بدر، تدل في البعد الإنساني والعملي على قوة المجموعة الصغيرة المخلصة المجتمعة حول هدف سامٍ وقدرتها على صناعة فارق حقيقي يتجاوز حسابات الكثرة العددية.',
      context: 'الفصل الثالث: رمز المسؤولية والعمل'
    },
    {
      term: 'تزامن 11:11',
      category: 'علم النفس الإدراكي',
      definition: 'ملاحظة تكرار الأرقام المتماثلة في الساعة، والتي ترتبط في الوعي النفسي بلحظة استيقاظ أو تذكير داخلي يتخذه الإنسان فرصة لمراجعة أهدافه وتصحيح اتجاهه في الحياة الحاضرة.',
      context: 'الفصل الثالث: إشارات الزمان'
    }
  ],
  backCover: {
    imageSource: 'صورة 7 (شعار QR Code الموحد مع الدوائر المحيطة)',
    title: 'منظومة الصروح والتحول الرقمي',
    footerText: 'امسح الكود لفتح الموقع: md7-group.ai.studio',
    qrUrl: 'https://md7-group.ai.studio',
    nodes: [
      {
        id: 'MD1',
        label: 'MD1',
        role: 'الرؤية والابتكار',
        colorClass: 'from-amber-400 to-yellow-600',
        colorHex: '#D4AF37',
        description: 'البوابة الاستراتيجية وتوليد الأفكار'
      },
      {
        id: 'MD2',
        label: 'MD2',
        role: 'الإدارة والحوكمة',
        // ADJUSTMENT: Color is strictly dark brown / golden bronze (#6D4C24), green is abolished
        colorClass: 'from-amber-800 to-stone-900',
        colorHex: '#6D4C24',
        description: 'إدارة المنظومة والقيادة المؤسسية المعتمدة'
      },
      {
        id: 'MD3',
        label: 'MD3',
        role: 'التطوير والتنفيذ',
        colorClass: 'from-yellow-500 to-amber-700',
        colorHex: '#C5A059',
        description: 'التطبيقات البرمجية والمشاريع المتكاملة'
      },
      {
        id: 'MD4',
        label: 'MD4',
        role: 'الاستدامة والمستقبل',
        colorClass: 'from-stone-700 to-amber-900',
        colorHex: '#8C6D3B',
        description: 'المشاريع البيئية والواقع الافتراضي'
      }
    ]
  }
};

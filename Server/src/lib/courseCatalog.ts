export interface CourseData {
  id: string;
  level: 'SSC' | 'HSC';
  title: string;
  subtitle: string;
  subjects: string[];
  services: string[];
  price: number;
  oldPrice: number;
  privateGroupUrl: string;
}

export const INITIAL_COURSES: CourseData[] = [
  {
    id: 'ssc-final-revision',
    level: 'SSC',
    title: 'Final Revision Batch',
    subtitle: 'SSC ২০২৫ • বিজ্ঞান বিভাগ',
    subjects: ['পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান'],
    services: [
      '১২০+ লাইভ ক্লাস',
      '৪৫০+ লেকচার শিট',
      '২৪/৭ ডাউট সলভ গ্রুপ',
      'কোর্সের মেয়াদ ১ বছর',
      'লাইভ MCQ এক্সাম',
      'সাবজেক্ট ফাইনাল পরীক্ষা',
    ],
    price: 2490,
    oldPrice: 4000,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-ssc-revision',
  },
  {
    id: 'hsc-academic',
    level: 'HSC',
    title: 'Academic Batch',
    subtitle: 'HSC ২০২৬ • পূর্ণাঙ্গ প্রস্তুতি',
    subjects: ['পদার্থবিজ্ঞান ১ম ও ২য়', 'রসায়ন ১ম ও ২য়', 'উচ্চতর গণিত'],
    services: [
      '১৬০+ ইন্টার‍্যাক্টিভ লাইভ ক্লাস',
      'প্রিন্টেড লেকচার নোট PDF',
      'সাপ্তাহিক মডেল টেস্ট',
      'মেন্টরশিপ সাপোর্ট',
      'চ্যাপ্টারভিত্তিক টেস্ট',
      'রেকর্ডেড ক্লাসের ব্যাকআপ',
    ],
    price: 3990,
    oldPrice: 6000,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-hsc-academic-2026',
  },
  {
    id: 'english-ict',
    level: 'HSC',
    title: 'English + ICT Course',
    subtitle: 'HSC ২০২৫–২৬ • স্পেশাল কোর্স',
    subjects: ['ইংরেজি ১ম পত্র', 'ইংরেজি ২য় পত্র', 'ICT সম্পূর্ণ'],
    services: [
      '৮০+ স্পেশাল লাইভ ক্লাস',
      'টপিকভিত্তিক প্র্যাকটিস বুক',
      'নিয়মিত কুইজ এক্সাম',
      'টপ স্কোরার গাইডলাইন',
    ],
    price: 1990,
    oldPrice: 3000,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-english-ict',
  },
  {
    id: 'ssc-full-prep-2026',
    level: 'SSC',
    title: 'SSC ২০২৬ পূর্ণাঙ্গ প্রস্তুতি ব্যাচ (বিজ্ঞান বিভাগ)',
    subtitle: 'পদার্থ, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান সম্পূর্ণ সিলেবাস ১০০ দিনে শেষ করার স্পেশাল কোর্স।',
    subjects: ['পদার্থবিজ্ঞান (Physics)', 'রসায়ন (Chemistry)', 'উচ্চতর গণিত (Higher Math)', 'জীববিজ্ঞান (Biology)'],
    services: [
      'সাপ্তাহিক লাইভ ক্লাস ও বিস্তারিত লেকচার শীট',
      'অধ্যায়ভিত্তিক মডেল টেস্ট ও CQ/MCQ সলভ',
      'প্রাইভেট ফেসবুক গ্রুপ ও টেলিগ্রাম ডিসকাশন সাপোর্ট',
      'বোর্ড পরীক্ষার স্ট্যান্ডার্ড স্পেশাল সাজেশন বুকলেট',
    ],
    price: 2990,
    oldPrice: 4500,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad.ssc2026.private',
  },
  {
    id: 'hsc-physics-chem-2026',
    level: 'HSC',
    title: 'HSC ২০২৬ ফিজিক্স ও কেমিস্ট্রি মাস্টারক্লাস',
    subtitle: 'বেসিক থেকে অ্যাডভান্সড — বোর্ড পরীক্ষা ও ইঞ্জিনিয়ারিং/মেডিকেল এডমিশন ফাউন্ডেশন।',
    subjects: ['পদার্থবিজ্ঞান ১ম ও ২য় পত্র', 'রসায়ন ১ম ও ২য় পত্র'],
    services: [
      'টপিকভিত্তিক কনসেপ্ট ক্লিয়ারিং ক্লাস',
      'গাণিতিক সমস্যা সমাধান ও শর্টকাট ট্রিকস',
      'মডেল টেস্ট এবং লাইভ প্রবলেম সলভিং সেশন',
      'প্রাইভেট ডিসকাশন গ্রুপে মেন্টরদের সার্বক্ষণিক গাইডেন্স',
    ],
    price: 3490,
    oldPrice: 5000,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad.hsc2026.private',
  },
  {
    id: 'ssc-hmath-special-2026',
    level: 'SSC',
    title: 'SSC ২০২৬ হায়ার ম্যাথ স্পেশাল কোর্স',
    subtitle: 'উচ্চতর গণিতের জ্যামিতি, ত্রিকোণমিতি ও সম্ভাব্যতা সহজেই ১০০ তে ১০০ পাওয়ার সিক্রেট ফর্মুলা।',
    subjects: ['উচ্চতর গণিত (Higher Mathematics)'],
    services: [
      'প্রতিটি অধ্যায়ের মূল কনসেপ্ট ও সূত্র বিশ্লেষণ',
      'বোর্ড বিগত ১০ বছরের প্রশ্ন সমাধান',
      'নিয়মিত হোমওয়ার্ক মূল্যায়ন ও ফিডব্যাক',
      'সিক্রেট ফেসবুক গ্রুপে লাইভ ডাউট সলভিং',
    ],
    price: 1990,
    oldPrice: 3000,
    privateGroupUrl: 'https://facebook.com/groups/geniussquad.ssc.hmath.private',
  },
];

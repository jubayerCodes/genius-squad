export interface Course {
  id: string
  level: 'SSC' | 'HSC'
  title: string
  subtitle: string
  subjects: string[]
  price: string
  rawPrice: number
  oldPrice: string
  accent?: string
  privateGroupUrl?: string
  description?: string
  features?: string[]
  thumbnailUrl?: string | null
  isActive?: boolean
  _count?: {
    enrollments: number
  }
}

export interface UserProfile {
  id: string
  name: string
  father_name: string
  district: string
  upazila: string
  institution: string
  email: string
  phone: string
  facebook_url: string
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN'
  isSuspended?: boolean
}

export interface Enrollment {
  id: string
  userId: string
  studentName: string
  studentPhone: string
  studentEmail: string
  facebookUrl: string
  institution: string
  district: string
  courseId: string
  courseTitle: string
  amount: string
  paymentMethod: 'bKash' | 'Nagad'
  senderNumber: string
  transactionId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  createdAt: string
  verifiedAt?: string
}

// Convert Bengali digits (০-৯) to English numbers (0-9)
export function parseBengaliPrice(priceStr: string): number {
  if (!priceStr) return 0
  const bengaliToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  }
  const clean = priceStr
    .split('')
    .map((char) => bengaliToEnglish[char] || (char >= '0' && char <= '9' ? char : ''))
    .join('')
  return parseInt(clean, 10) || 0
}

// Convert integer to Bengali numeral string
export function toBengaliNumber(num: number): string {
  const englishToBengali: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  }
  return num
    .toLocaleString('en-US')
    .split('')
    .map((char) => englishToBengali[char] || char)
    .join('')
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'ssc-final-revision',
    level: 'SSC',
    title: 'Final Revision Batch',
    subtitle: 'SSC ২০২৫ • বিজ্ঞান বিভাগ',
    subjects: ['পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান'],
    price: '৳ ২,৪৯০',
    rawPrice: 2490,
    oldPrice: '৳ ৪,০০০',
    accent: '#86efac',
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-ssc-revision',
    description: 'বোর্ড পরীক্ষার জন্য পরিকল্পিত এই কোর্সে বেসিক থেকে অ্যাডভান্সড প্রতিটি বিষয় সহজভাবে শেখানো হবে। বিগত ১০ বছরের বোর্ড প্রশ্ন সমাধান ও অধ্যায়ভিত্তিক বিশেষ রিভিশন ক্লাস।',
    features: ['১২০+ লাইভ ক্লাস', '৪৫০+ লেকচার শিট', '২৪/৭ ডাউট সলভ গ্রুপ', 'কোর্সের মেয়াদ ১ বছর', 'লাইভ MCQ এক্সাম', 'সাবজেক্ট ফাইনাল পরীক্ষা'],
  },
  {
    id: 'hsc-academic',
    level: 'HSC',
    title: 'Academic Batch',
    subtitle: 'HSC ২০২৬ • পূর্ণাঙ্গ প্রস্তুতি',
    subjects: ['পদার্থবিজ্ঞান ১ম ও ২য়', 'রসায়ন ১ম ও ২য়', 'উচ্চতর গণিত'],
    price: '৳ ৩,৯৯০',
    rawPrice: 3990,
    oldPrice: '৳ ৬,০০০',
    accent: '#fbbf24',
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-hsc-academic-2026',
    description: 'এইচএসসি বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য সম্পূর্ণ সিলেবাস কভার করার মাস্টার কোর্স। বেসিক কনসেপ্ট ক্লিয়ারিং ক্লাস থেকে শুরু করে বোর্ড ও এডমিশন স্ট্যান্ডার্ড প্রস্তুতি।',
    features: ['১৬০+ ইন্টার‍্যাক্টিভ লাইভ ক্লাস', 'প্রিন্টেড লেকচার নোট PDF', 'সাপ্তাহিক মডেল টেস্ট', 'মেন্টরশিপ সাপোর্ট', 'চ্যাপ্টারভিত্তিক টেস্ট', 'রেকর্ডেড ক্লাসের ব্যাকআপ'],
  },
  {
    id: 'english-ict',
    level: 'HSC',
    title: 'English + ICT Course',
    subtitle: 'HSC ২০২৫–২৬ • স্পেশাল কোর্স',
    subjects: ['ইংরেজি ১ম পত্র', 'ইংরেজি ২য় পত্র', 'ICT সম্পূর্ণ'],
    price: '৳ ১,৯৯০',
    rawPrice: 1990,
    oldPrice: '৳ ৩,০০০',
    accent: '#67e8f9',
    privateGroupUrl: 'https://facebook.com/groups/geniussquad-english-ict',
    description: 'এইচএসসির বাধ্যতামূলক বিষয়গুলোতে সর্বোচ্চ নম্বর নিশ্চিত করার বিশেষ কোর্স। গ্রামার, রিডিং, রাইটিং এবং আইসিটির কঠিন প্রোগ্রামিং চ্যাপ্টারগুলো পানির মতো সহজ পদ্ধতিতে শেখানো হবে।',
    features: ['৮০+ স্পেশাল লাইভ ক্লাস', 'টপিকভিত্তিক প্র্যাকটিস বুক', 'নিয়মিত কুইজ এক্সাম', 'টপ স্কোরার গাইডলাইন'],
  },
]

export const DEFAULT_STUDENT: UserProfile | null = null
export const DEFAULT_ADMIN: UserProfile | null = null

export const INITIAL_ENROLLMENTS: Enrollment[] = []

// Mock LocalStorage Store Helper Functions
const STORE_KEY_USER = 'gs_current_user'
const STORE_KEY_ENROLLMENTS = 'gs_enrollments'

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORE_KEY_USER)
  if (data) {
    try {
      const u = JSON.parse(data)
      if (u && u.email !== 'nabila@example.com' && u.name !== 'নাবিলা রহমান') {
        return u
      } else {
        localStorage.removeItem(STORE_KEY_USER)
      }
    } catch {}
  }
  return null
}

export function setStoredUser(user: UserProfile | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(STORE_KEY_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORE_KEY_USER)
  }
}

export function getStoredEnrollments(): Enrollment[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORE_KEY_ENROLLMENTS)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        // Strip out any legacy dummy enrollments
        const cleaned = parsed.filter(
          (e: any) =>
            !['enr_101', 'enr_102', 'enr_103'].includes(e.id) &&
            e.studentName !== 'নাবিলা রহমান' &&
            e.studentEmail !== 'nabila@example.com'
        )
        localStorage.setItem(STORE_KEY_ENROLLMENTS, JSON.stringify(cleaned))
        return cleaned
      }
    } catch {}
  }
  return []
}

export function saveEnrollment(enrollment: Enrollment) {
  if (typeof window === 'undefined') return [enrollment]
  const list = getStoredEnrollments()
  const updated = [enrollment, ...list]
  localStorage.setItem(STORE_KEY_ENROLLMENTS, JSON.stringify(updated))
  return updated
}

export function updateEnrollmentStatus(id: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
  if (typeof window === 'undefined') return []
  const list = getStoredEnrollments()
  const updated = list.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        rejectionReason: reason,
        verifiedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      }
    }
    return item
  })
  localStorage.setItem(STORE_KEY_ENROLLMENTS, JSON.stringify(updated))
  return updated
}

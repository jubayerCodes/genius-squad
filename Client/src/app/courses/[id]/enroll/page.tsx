'use client'

import { use, useState, FormEvent, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import courseImage from '../../../../assets/course-study.jpg'
import { INITIAL_COURSES } from '../../../../data/mockData'
import DistrictSelect from '../../../../components/DistrictSelect'
import { useAuth } from '../../../../context/AuthContext'

const facebookUrlRegex =
  /^(https?:\/\/)?((www|web|m)\.)?(facebook\.com|fb\.com)\/(profile\.php\?id=\d+|[a-zA-Z0-9.\-_]{3,})\/?.*$/i

export default function CourseEnrollPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, setPendingEnrollmentData } = useAuth()

  const course = INITIAL_COURSES.find((c) => c.id === resolvedParams.id)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    father_name: user?.father_name || '',
    district: user?.district || '',
    upazila: user?.upazila || '',
    institution: user?.institution || '',
    email: user?.email || '',
    phone: user?.phone || '',
    facebook_url: user?.facebook_url || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        father_name: user.father_name || '',
        district: user.district || '',
        upazila: user.upazila || '',
        institution: user.institution || '',
        email: user.email || '',
        phone: user.phone || '',
        facebook_url: user.facebook_url || '',
      })
    }
  }, [user])

  const [errorMessage, setErrorMessage] = useState('')

  if (!course) {
    return (
      <main className="mx-auto max-w-[1240px] px-5 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">কোর্সটি পাওয়া যায়নি</h1>
        <p className="mt-2 text-slate-400">আপনার অনুরোধকৃত কোর্সটির সঠিক লিংক দিন।</p>
        <Link href="/" className="primary-button mt-6 inline-flex">
          সকল কোর্স দেখুন
        </Link>
      </main>
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.district) {
      setErrorMessage('অনুগ্রহ করে জেলা নির্বাচন করুন।')
      return
    }

    if (!facebookUrlRegex.test(formData.facebook_url.trim())) {
      setErrorMessage(
        'সঠিক ফেসবুক প্রোফাইল লিংক দিন (যেমন: https://facebook.com/yourprofile বা https://fb.com/yourprofile)'
      )
      return
    }

    setPendingEnrollmentData(formData)
    router.push(`/courses/${course.id}/payment`)
  }

  return (
    <main className="mx-auto max-w-[1040px] px-5 py-12 lg:px-8">
      {/* Intro Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            ← কোর্স বিস্তারিত পাতায় ফিরে যান
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/30 bg-[#b7f34a]/10 px-3 py-1 text-xs font-semibold text-[#b7f34a]">
            ধাপ ১ / ২
          </div>
        </div>
        <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
          শিক্ষার্থীর এনরোলমেন্ট তথ্য
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          সঠিক তথ্য দিয়ে নিচের ফর্মটি পূরণ করুন। এই তথ্যের মাধ্যমে আপনার স্টুডেন্ট আইডি ও প্রাইভেট গ্রুপ অ্যাক্সেস ভেরিফাই করা হবে।
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
        {/* Form Card */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#0c1915] p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label">শিক্ষার্থীর পুরো নাম *</label>
              <input
                required
                type="text"
                placeholder="আপনার পুরো নাম লিখুন"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label className="field-label">পিতার নাম *</label>
              <input
                required
                type="text"
                placeholder="আপনার পিতার নাম লিখুন"
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <DistrictSelect
                label="জেলা"
                required
                value={formData.district}
                onChange={(val) => setFormData({ ...formData, district: val })}
              />
            </div>

            <div>
              <label className="field-label">উপজেলা *</label>
              <input
                required
                type="text"
                placeholder="উপজেলা লিখুন (যেমন: সদর, মিরপুর)"
                value={formData.upazila}
                onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">স্কুল বা কলেজ *</label>
              <input
                required
                type="text"
                placeholder="আপনার বর্তমান শিক্ষা প্রতিষ্ঠানের নাম"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label className="field-label">ইমেইল ঠিকানা *</label>
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label className="field-label">ফোন নম্বর *</label>
              <input
                required
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">ফেসবুক প্রোফাইল লিংক (Facebook Profile URL) *</label>
              <input
                required
                type="text"
                placeholder="https://facebook.com/yourprofile"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                className="field"
              />
              <small className="mt-1 block text-[11px] text-slate-500">
                * পেমেন্ট কনফার্মেশনের পর এই আইডির মাধ্যমে প্রাইভেট গ্রুপে জয়েন করতে হবে।
              </small>
            </div>
          </div>

          <button type="submit" className="primary-button mt-8 w-full justify-center !py-3 text-sm">
            পেমেন্টে এগিয়ে যান (ধাপ ২) →
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <aside className="h-fit rounded-2xl border border-white/10 bg-[#0c1915] p-6 lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-[16/9]">
            <img
              src={(courseImage as any)?.src || (courseImage as any)}
              alt={course.title}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-[#07110e]/80 px-2.5 py-1 text-xs font-bold text-[#b7f34a] backdrop-blur">
              {course.level}
            </span>
          </div>

          <h3 className="mt-4 font-display text-lg font-bold text-white">{course.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{course.subtitle}</p>

          <div className="my-5 border-t border-white/[.08] pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>কোর্স রেগুলার ফি</span>
              <del>{course.oldPrice}</del>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>বিশেষ ছাড়</span>
              <span className="text-emerald-400">অ্যাক্টিভ</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white border-t border-white/[.08] pt-3">
              <span>সর্বমোট প্রদেয়</span>
              <strong className="text-xl text-[#b7f34a] font-display">{course.price}</strong>
            </div>
          </div>

          <div className="rounded-xl bg-white/[.03] p-3 text-xs text-slate-400 space-y-2">
            <p className="flex items-center gap-2">
              <span className="text-[#b7f34a]">✓</span> দ্রুত ম্যানুয়াল ভেরিফিকেশন
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[#b7f34a]">✓</span> বিকাশ ও নগদ কিউআর পেমেন্ট
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[#b7f34a]">✓</span> সরাসরি ফেসবুক সিক্রেট গ্রুপ লিংক
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}

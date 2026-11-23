'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { INITIAL_COURSES, Course, toBengaliNumber } from '../../../data/mockData'
import { Icon } from '../../../components/Icon'
import { apiClient } from '../../../lib/apiClient'

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const initialCourse = INITIAL_COURSES.find((c) => c.id === resolvedParams.id)
  const [course, setCourse] = useState<Course | undefined>(initialCourse)

  useEffect(() => {
    let mounted = true
    const fetchCourse = async () => {
      try {
        const res = await apiClient.getCourse(resolvedParams.id)
        if (mounted && res.data?.course) {
          const c = res.data.course
          const liveCourse: Course = {
            id: c.id,
            title: c.title,
            subtitle: c.subtitle || '',
            level: (c.level === 'SSC' || c.level === 'HSC') ? c.level : 'SSC',
            price: typeof c.price === 'number' ? `৳${toBengaliNumber(c.price)}` : (c.price || '৳০'),
            rawPrice: typeof c.price === 'number' ? c.price : 0,
            oldPrice: typeof c.oldPrice === 'number' ? `৳${toBengaliNumber(c.oldPrice)}` : (c.oldPrice || ''),
            subjects: c.subjects || [],
            features: c.services || c.features || [],
            description: c.description || c.subtitle || '',
            accent: c.accent || '#b7f34a',
            privateGroupUrl: c.privateGroupUrl || 'https://facebook.com',
            thumbnailUrl: c.thumbnailUrl || null,
          }
          setCourse(liveCourse)
        }
      } catch {
        // Fallback to local data
      }
    }
    fetchCourse()
    return () => {
      mounted = false
    }
  }, [resolvedParams.id])

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

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        ← সকল কোর্সে ফিরে যান
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.35fr_.65fr]">
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <img
              src={course.thumbnailUrl || '/assets/course-study.jpg'}
              alt={course.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.onerror = null
                target.src = '/assets/course-study.jpg'
              }}
              className="aspect-[16/8] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07110e]/80 to-transparent" />
            <span className="absolute bottom-5 left-5 rounded-full bg-[#b7f34a] px-3.5 py-1 text-xs font-black text-[#07110e]">
              {course.level} ব্যাচ
            </span>
          </div>

          <div className="mt-8">
            <p className="section-kicker">{course.subtitle}</p>
            <h1 className="font-display text-4xl font-black text-white">{course.title}</h1>
            <p className="mt-5 leading-8 text-slate-400">{course.description}</p>
          </div>

          <h2 className="mt-10 font-display text-xl font-bold text-white">যে বিষয়গুলো থাকছে</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(course.subjects || []).map((sub) => (
              <div
                key={sub}
                className="flex items-center gap-2.5 rounded-xl border border-white/[.07] bg-white/[.02] p-4 text-sm font-semibold text-slate-200"
              >
                <span className="size-2 rounded-full bg-[#b7f34a]" />
                {sub}
              </div>
            ))}
          </div>

          <h2 className="mt-10 font-display text-xl font-bold text-white">কোর্সের সুবিধাসমূহ</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(course.features || []).map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-xl border border-white/[.07] bg-[#0c1915] p-4 text-xs font-medium text-slate-300"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#b7f34a]/10 text-[#b7f34a]">
                  <Icon name="check" size={14} />
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Pricing and Enroll CTA Card */}
        <div className="lg:pl-6">
          <div className="sticky top-28 rounded-3xl border border-white/10 bg-[#0c1915] p-6 shadow-2xl sm:p-8">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-black text-white">{course.price}</span>
              {course.oldPrice && (
                <span className="text-base text-slate-500 line-through">{course.oldPrice}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#b7f34a] font-semibold">এককালীন ফি • কোনো লুকায়িত চার্জ নেই</p>

            <Link
              href={`/courses/${course.id}/enroll`}
              className="primary-button mt-6 w-full justify-center !py-3.5 text-sm"
            >
              এখনই ভর্তি হোন <Icon name="arrow" size={18} />
            </Link>

            <div className="mt-6 border-t border-white/[.08] pt-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[#b7f34a]">✓</span> লাইভ ক্লাস মিস হলে ফুল রেকর্ডেড ব্যাকআপ
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[#b7f34a]">✓</span> ২৪/৭ ডেডিকেটেড ডিসকাশন গ্রুপ অ্যাক্সেস
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[#b7f34a]">✓</span> কোর্স শেষে ভেরিফায়েড সার্টিফিকেট
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

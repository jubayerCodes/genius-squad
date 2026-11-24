'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { INITIAL_COURSES, Course, toBengaliNumber } from '../data/mockData'
import { CourseCard } from '../components/CourseCard'
import { CourseCardSkeleton } from '../components/Skeleton'
import { Icon } from '../components/Icon'
import { apiClient } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES)
  const [isCoursesLoading, setIsCoursesLoading] = useState(false)
  const [filter, setFilter] = useState<'সব কোর্স' | 'SSC' | 'HSC'>('সব কোর্স')

  useEffect(() => {
    let mounted = true
    const loadCourses = async () => {
      try {
        setIsCoursesLoading(true)
        const res = await apiClient.getCourses()
        if (mounted && res.data?.courses && res.data.courses.length > 0) {
          const liveList: Course[] = res.data.courses.map((c: any) => ({
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
            isActive: c.isActive !== false,
          }))
          setCourses(liveList)
        }
      } catch {
        // Fallback safely to initial courses
      } finally {
        if (mounted) setIsCoursesLoading(false)
      }
    }
    loadCourses()
    return () => {
      mounted = false
    }
  }, [])

  const shown = filter === 'সব কোর্স' ? courses : courses.filter((c) => c.level === filter)

  return (
    <main>
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="glow absolute -left-32 top-32 size-96 rounded-full bg-[#b7f34a]/10 blur-[120px]" />
        <div className="relative mx-auto grid min-h-[690px] max-w-[1240px] items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/20 bg-[#b7f34a]/[.07] px-3.5 py-1.5 text-xs font-semibold text-[#b7f34a]">
              <span className="size-2 rounded-full bg-[#b7f34a]" /> এখনই ভর্তি চলছে • সীমিত আসন
            </div>
            <h1 className="max-w-2xl font-display text-4xl font-black leading-[1.15] tracking-tight text-white sm:text-6xl">
              প্রস্তুতি হোক <span className="text-[#b7f34a]">জিনিয়াসদের</span> মতো
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400">
              দেশসেরা শিক্ষকদের সাথে SSC ও HSC-এর পূর্ণাঙ্গ প্রস্তুতি। লাইভ ক্লাস, পরীক্ষা আর নিয়মিত গাইডলাইনে এগিয়ে থাকো প্রতিদিন।
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                className="primary-button"
              >
                কোর্স দেখুন <Icon name="arrow" size={18} />
              </button>
              {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? (
                <Link
                  href="/admin"
                  className="secondary-button !border-amber-400/40 !bg-amber-400/10 !text-amber-300 hover:!bg-amber-400/20"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-amber-400/20 text-amber-300">
                    🛡️
                  </span>
                  অ্যাডমিন প্যানেল
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="secondary-button"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-white/10">
                    <Icon name="play" size={12} />
                  </span>
                  আমার ড্যাশবোর্ড
                </Link>
              )}
            </div>
            <div className="mt-12 flex flex-wrap gap-8">
              {[
                ['১২K+', 'শিক্ষার্থী'],
                ['৪.৯/৫', 'গড় রেটিং'],
                ['৯২%', 'সফলতার হার'],
              ].map(([v, l]) => (
                <div key={l}>
                  <strong className="font-display text-2xl text-white">{v}</strong>
                  <span className="ml-2 text-xs text-slate-400">{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[530px]">
            <div className="teacher-frame relative overflow-hidden border border-white/10 bg-[#0d1b17] shadow-2xl">
              <img
                src="/assets/teachers.jpg"
                alt="Genius Squad teachers"
                className="h-[520px] w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07110e] via-transparent to-transparent" />
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="absolute bottom-7 left-7 flex items-center gap-3 rounded-xl border border-white/10 bg-[#07110e]/85 p-3 pr-5 text-left backdrop-blur transition hover:bg-[#07110e]"
              >
                <span className="grid size-11 place-items-center rounded-full bg-[#b7f34a] text-[#07110e]">
                  <Icon name="play" />
                </span>
                <span>
                  <small className="block text-[10px] text-slate-400">আমাদের গল্প</small>
                  <strong className="text-sm text-white">১ মিনিটে দেখে নাও</strong>
                </span>
              </button>
            </div>
            <div className="absolute -right-3 top-12 rounded-xl border border-white/10 bg-[#10211b]/95 p-3 shadow-2xl sm:-right-8">
              <span className="text-xs text-slate-400">আজকের লাইভ ক্লাস</span>
              <strong className="mt-1 block text-sm text-white">পদার্থবিজ্ঞান • ৮:০০ PM</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Catalog Section with Filter */}
      <section id="courses" className="border-t border-white/[.06] py-24">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="section-kicker">তোমার ক্লাস, তোমার কোর্স</p>
              <h2 className="section-title">সঠিক প্রস্তুতি শুরু হোক এখানে</h2>
            </div>
            <div className="flex w-fit rounded-xl border border-white/[.08] bg-[#0c1915] p-1.5">
              {(['সব কোর্স', 'SSC', 'HSC'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-5 py-2 text-xs font-bold transition ${
                    filter === item ? 'bg-[#b7f34a] text-[#07110e]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isCoursesLoading && courses.length === 0 ? (
              [1, 2, 3].map((n) => <CourseCardSkeleton key={n} />)
            ) : (
              shown.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <div className="rounded-[32px] border border-white/[.07] bg-[#0b1814] p-7 md:p-14">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="section-kicker">কেন Genius Squad?</p>
                <h2 className="section-title">
                  শুধু ক্লাস নয়,<br />সম্পূর্ণ লার্নিং সিস্টেম
                </h2>
                <p className="mt-5 leading-7 text-slate-400">
                  বোঝা, অনুশীলন ও মূল্যায়ন—সাফল্যের প্রতিটি ধাপে আমরা আছি তোমার সাথে। আমাদের অভিজ্ঞ শিক্ষক ও মেন্টর দল সার্বক্ষণিক গাইডেন্সে পাশে থাকবে।
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['01', 'ইন্টার‍্যাক্টিভ লাইভ ক্লাস', 'প্রশ্ন করো, বুঝে নাও ক্লাসেই। সরাসরি কথা বলার সুযোগ।'],
                  ['02', 'স্মার্ট পরীক্ষা পদ্ধতি', 'নিজের দুর্বলতা জানো বিস্তারিত রিপোর্টে ও লিডারবোর্ডে।'],
                  ['03', 'এক্সপার্ট মেন্টরশিপ', 'পরীক্ষার স্ট্র্যাটেজি ও স্ট্রেস ম্যানেজমেন্টে ব্যক্তিগত গাইডলাইন।'],
                  ['04', 'রেকর্ডেড ক্লাসের ব্যাকআপ', 'যেকোনো সময়, যেকোনো ডিভাইস থেকে রিভিশন দাও সম্পূর্ণ সহজে।'],
                ].map(([n, t, d]) => (
                  <div key={n} className="rounded-xl border border-white/[.07] bg-white/[.025] p-5">
                    <span className="font-display text-xs text-[#b7f34a] font-black">{n}</span>
                    <h3 className="mt-4 font-display font-bold text-white text-base">{t}</h3>
                    <p className="mt-2 text-xs leading-6 text-slate-400">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <span className="mb-4 inline-block text-5xl text-[#b7f34a]">“</span>
          <blockquote className="font-display text-2xl font-bold leading-relaxed text-white">
            Genius Squad-এর পরীক্ষাগুলো আমাকে সময় ম্যানেজমেন্ট শিখিয়েছে। এখন কঠিন প্রশ্ন দেখলেও আর ভয় লাগে না।
          </blockquote>
          <p className="mt-6 text-sm text-slate-400">
            <strong className="text-white">ফারহান আহমেদ</strong> • HSC ব্যাচ শিক্ষার্থী
          </p>
        </div>
      </section>
    </main>
  )
}

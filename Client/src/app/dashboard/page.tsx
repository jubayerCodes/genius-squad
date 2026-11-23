'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Enrollment, Course, INITIAL_COURSES } from '../../data/mockData'
import { apiClient } from '../../lib/apiClient'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import { DashboardEnrollmentSkeleton } from '../../components/Skeleton'

function DashboardContent() {
  const { user } = useAuth()
  const [liveEnrollments, setLiveEnrollments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const courses: Course[] = INITIAL_COURSES

  // Fetch live enrollments from API
  useEffect(() => {
    let mounted = true
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const res = await apiClient.getMyCourses()
        if (mounted && res.data?.enrollments) {
          setLiveEnrollments(res.data.enrollments)
        } else if (mounted) {
          setLiveEnrollments([])
        }
      } catch {
        if (mounted) setLiveEnrollments([])
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchCourses()
    return () => {
      mounted = false
    }
  }, [user])

  // Filter enrollments for current student
  const studentEnrollments = liveEnrollments

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0c1c16] to-[#07130f] p-7 sm:p-10">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-72 rounded-full bg-[#b7f34a]/10 blur-[80px] pointer-events-none" />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/30 bg-[#b7f34a]/10 px-3 py-1 text-xs font-semibold text-[#b7f34a]">
              <span className="size-2 rounded-full bg-[#b7f34a]" /> স্টুডেন্ট ড্যাশবোর্ড
            </div>
            <h1 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
              স্বাগতম, {user?.name || 'শিক্ষার্থী'}!
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              তোমার অ্যাকাউন্টের সকল কোর্স ও লাইভ ব্যাচ সংক্রান্ত তথ্য নিচে দেওয়া হলো।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/profile"
              className="secondary-button !text-xs !py-2.5"
            >
              <span>⚙️</span> প্রোফাইল এডিট করুন
            </Link>
            <Link
              href="/"
              className="primary-button !text-xs !py-2.5"
            >
              + নতুন কোর্স দেখুন
            </Link>
          </div>
        </div>

        {/* Student Quick Demographic Summary */}
        {user && (
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/[.08] pt-6 sm:grid-cols-4 text-xs">
            <div>
              <span className="text-slate-500 block">শিক্ষা প্রতিষ্ঠান</span>
              <strong className="text-white mt-1 block truncate">{user.institution}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">জেলা ও উপজেলা</span>
              <strong className="text-white mt-1 block">{user.district}, {user.upazila}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">ফোন নম্বর</span>
              <strong className="text-white mt-1 block">{user.phone}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">ফেসবুক প্রোফাইল</span>
              <a
                href={user.facebook_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#b7f34a] hover:underline mt-1 block truncate"
              >
                প্রোফাইল লিংক ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Enrolled Courses Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">আমার কোর্সসমূহ</h2>
            <p className="text-xs text-slate-400 mt-1">
              মোট এনরোল করা কোর্স: {studentEnrollments.length} টি
            </p>
          </div>
        </div>

        {isLoading && liveEnrollments.length === 0 ? (
          <DashboardEnrollmentSkeleton />
        ) : studentEnrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-white/[.01]">
            <p className="text-base text-slate-400">তুমি এখনও কোনো কোর্সে এনরোল করোনি।</p>
            <Link
              href="/"
              className="primary-button mt-5 inline-flex"
            >
              কোর্স ব্রাউজ করুন
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studentEnrollments.map((enrollment) => {
              const course = courses.find((c) => c.id === enrollment.courseId)
              const isApproved = enrollment.status === 'APPROVED'
              const isPending = enrollment.status === 'PENDING'
              const groupUrl = enrollment.privateGroupUrl || course?.privateGroupUrl

              return (
                <div
                  key={enrollment.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c1915] p-6 transition duration-300 hover:border-white/20"
                >
                  <div>
                    {/* Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white/[.06] px-2.5 py-1 text-[11px] font-bold text-slate-300">
                        {course?.level || enrollment.courseLevel || 'ব্যাচ'}
                      </span>
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-400" /> অনুমোদিত
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" /> যাচাইকরণাধীন
                        </span>
                      )}
                      {enrollment.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-400">
                          <span className="size-1.5 rounded-full bg-rose-400" /> বাতিল
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 font-display text-xl font-bold text-white">
                      {enrollment.courseTitle}
                    </h3>

                    {/* Payment Info Metadata */}
                    <div className="mt-4 space-y-1.5 rounded-xl bg-white/[.025] p-3 text-xs text-slate-400 border border-white/[.05]">
                      <div className="flex justify-between">
                        <span>পেমেন্ট মাধ্যম:</span>
                        <strong className="text-white">{enrollment.paymentMethod || enrollment.method}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>প্রেরক নম্বর:</span>
                        <strong className="text-white">{enrollment.senderNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>TrxID:</span>
                        <span className="font-mono text-[#b7f34a] font-bold">{enrollment.transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ফি:</span>
                        <span className="text-white font-semibold">
                          {typeof enrollment.amount === 'number' ? `৳ ${enrollment.amount.toLocaleString('bn-BD')}` : enrollment.amount}
                        </span>
                      </div>
                    </div>

                    {/* Conditional Status Notice */}
                    {isPending && (
                      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[.06] p-3 text-xs text-amber-300 leading-relaxed">
                        ⚠️ আপনার পেমেন্টটি বর্তমানে যাচাই করা হচ্ছে। সাধারণত ৩০ মিনিট থেকে ২ ঘণ্টার মধ্যে অ্যাডমিন ভেরিফাই করে থাকেন।
                      </div>
                    )}

                    {enrollment.status === 'REJECTED' && (
                      <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[.06] p-3 text-xs text-rose-300 leading-relaxed">
                        ❌ পেমেন্টটি বাতিল হয়েছে: {enrollment.rejectionReason || 'ভুল TrxID বা তথ্য মিলছে না'}। সহায়তার জন্য কল করুন: ০১৭০০-০০০০০০।
                      </div>
                    )}
                  </div>

                  {/* Action / Fulfillment Button */}
                  <div className="mt-6 border-t border-white/[.08] pt-4">
                    {isApproved ? (
                      <a
                        href={groupUrl || 'https://facebook.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1877f2] py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(24,119,242,.25)] transition hover:bg-[#166fe5]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        প্রাইভেট ফেসবুক গ্রুপে যুক্ত হোন
                      </a>
                    ) : (
                      <Link
                        href={`/courses/${course?.id || enrollment.courseId}`}
                        className="w-full secondary-button justify-center !text-xs !py-2.5 inline-flex"
                      >
                        কোর্স আউটলাইন দেখুন
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <DashboardContent />
    </ProtectedRoute>
  )
}

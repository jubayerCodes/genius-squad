'use client'

import { use, useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { INITIAL_COURSES, Enrollment, saveEnrollment } from '../../../../data/mockData'
import { useAuth } from '../../../../context/AuthContext'
import { apiClient } from '../../../../lib/apiClient'

export default function CoursePaymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, pendingEnrollmentData, setEnrollments } = useAuth()

  const course = INITIAL_COURSES.find((c) => c.id === resolvedParams.id)

  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash')
  const [senderNumber, setSenderNumber] = useState(pendingEnrollmentData?.phone || user?.phone || '')
  const [transactionId, setTransactionId] = useState('')
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const TARGET_NUMBER = '০১৭০০-০০০০০০'
  const RAW_TARGET_NUMBER = '01700000000'

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

  const handleCopy = () => {
    navigator.clipboard.writeText(RAW_TARGET_NUMBER)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    const cleanTrx = transactionId.trim().toUpperCase()

    // Local validation
    if (cleanTrx.length < 6 || cleanTrx.length > 20) {
      setErrorMsg('সঠিক ট্রানজেকশন আইডি দিন (৬ থেকে ২০ অক্ষর)।')
      setIsSubmitting(false)
      return
    }

    try {
      if (!user) {
        setErrorMsg('এনরোলমেন্ট নিশ্চিত করতে অনুগ্রহ করে প্রথমে লগইন করুন।')
        setIsSubmitting(false)
        router.push(`/login?redirect=/courses/${course.id}/payment`)
        return
      }

      // Call live backend API (/api/v1/enrollments)
      const apiRes = await apiClient.createEnrollment({
        courseId: course.id,
        paymentMethod: method === 'bKash' ? 'BKASH' : 'NAGAD',
        senderNumber,
        transactionId: cleanTrx,
      })

      // Sync local state
      const newEnrollment: Enrollment = {
        id: apiRes.data?.enrollment?.id || `enr_${Date.now()}`,
        userId: user?.id || 'usr_student_demo',
        studentName: pendingEnrollmentData?.name || user?.name || 'শিক্ষার্থী',
        studentPhone: senderNumber,
        studentEmail: pendingEnrollmentData?.email || user?.email || 'student@example.com',
        facebookUrl: pendingEnrollmentData?.facebook_url || user?.facebook_url || 'https://facebook.com',
        institution: pendingEnrollmentData?.institution || user?.institution || 'শিক্ষা প্রতিষ্ঠান',
        district: pendingEnrollmentData?.district || user?.district || 'ঢাকা',
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price,
        paymentMethod: method,
        senderNumber,
        transactionId: cleanTrx,
        status: 'PENDING',
        createdAt: new Date().toLocaleDateString('bn-BD', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }) + `, ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`,
      }

      const updatedList = saveEnrollment(newEnrollment)
      setEnrollments(updatedList)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setErrorMsg(err.message || 'পেমেন্ট সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-[760px] px-5 py-12 lg:px-8">
      {/* Intro Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link
            href={`/courses/${course.id}/enroll`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            ← পূর্ববর্তী ধাপে ফিরে যান
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/30 bg-[#b7f34a]/10 px-3 py-1 text-xs font-semibold text-[#b7f34a]">
            ধাপ ২ / ২
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
            পেমেন্ট সম্পন্ন করুন
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            নিচের QR কোড স্ক্যান করে অথবা নম্বরে Send Money করে ট্রানজেকশন আইডি সাবমিট করুন।
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0c1915] p-6 sm:p-8">
        {/* Course Fee Summary Pill */}
        <div className="flex items-center justify-between rounded-xl bg-white/[.03] p-4 border border-white/[.06]">
          <div>
            <span className="text-xs text-slate-400 block">নির্বাচিত কোর্স:</span>
            <strong className="text-white text-sm">{course.title} ({course.level})</strong>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">প্রদেয় ফি:</span>
            <strong className="font-display text-xl text-[#b7f34a]">{course.price}</strong>
          </div>
        </div>

        {/* Payment Method Selector */}
        <p className="field-label mt-6">পেমেন্ট মাধ্যম নির্বাচন করুন:</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod('bKash')}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
              method === 'bKash'
                ? 'border-[#e2136e] bg-[#e2136e]/10 text-white shadow-[0_0_20px_rgba(226,19,110,.15)]'
                : 'border-white/10 bg-white/[.02] text-slate-400 hover:border-white/20'
            }`}
          >
            <span className="font-display text-xl font-black text-[#e2136e]">bKash (বিকাশ)</span>
            <span className="text-[11px] mt-1 text-slate-400">Personal / Send Money</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('Nagad')}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
              method === 'Nagad'
                ? 'border-[#f7941d] bg-[#f7941d]/10 text-white shadow-[0_0_20px_rgba(247,148,29,.15)]'
                : 'border-white/10 bg-white/[.02] text-slate-400 hover:border-white/20'
            }`}
          >
            <span className="font-display text-xl font-black text-[#f7941d]">Nagad (নগদ)</span>
            <span className="text-[11px] mt-1 text-slate-400">Personal / Send Money</span>
          </button>
        </div>

        {/* QR Code & Account Box */}
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-6 text-center">
          <div className="mx-auto size-48 rounded-2xl bg-white p-3 shadow-xl grid place-items-center relative group">
            {/* Stylized QR Code Representation */}
            <svg viewBox="0 0 100 100" className="size-full">
              {/* Corner markers */}
              <rect x="5" y="5" width="28" height="28" rx="4" fill="#07110e" />
              <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
              <rect x="13" y="13" width="12" height="12" fill="#07110e" />

              <rect x="67" y="5" width="28" height="28" rx="4" fill="#07110e" />
              <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
              <rect x="75" y="13" width="12" height="12" fill="#07110e" />

              <rect x="5" y="67" width="28" height="28" rx="4" fill="#07110e" />
              <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
              <rect x="13" y="75" width="12" height="12" fill="#07110e" />

              {/* Data matrix pattern */}
              <rect x="38" y="10" width="8" height="8" fill="#07110e" />
              <rect x="50" y="10" width="10" height="8" fill="#07110e" />
              <rect x="38" y="24" width="22" height="6" fill="#07110e" />
              <rect x="10" y="38" width="22" height="8" fill="#07110e" />
              <rect x="38" y="38" width="24" height="24" rx="4" fill={method === 'bKash' ? '#e2136e' : '#f7941d'} />
              <rect x="70" y="38" width="20" height="8" fill="#07110e" />
              <rect x="10" y="52" width="12" height="8" fill="#07110e" />
              <rect x="70" y="52" width="14" height="10" fill="#07110e" />
              <rect x="38" y="70" width="16" height="8" fill="#07110e" />
              <rect x="60" y="70" width="12" height="12" fill="#07110e" />
              <rect x="80" y="70" width="10" height="20" fill="#07110e" />
              <rect x="38" y="84" width="28" height="8" fill="#07110e" />
            </svg>
            <span className="absolute bottom-1 text-[9px] font-bold text-slate-700">
              {method} স্ক্যান করুন
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400">{method} Send Money নম্বর:</span>
            <strong className="text-white text-base tracking-wider font-mono">{TARGET_NUMBER}</strong>
            <button
              onClick={handleCopy}
              type="button"
              className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-[#b7f34a] hover:bg-white/20 transition"
            >
              {copied ? '✓ কপি হয়েছে' : 'কপি করুন'}
            </button>
          </div>

          <div className="mt-4 text-left rounded-xl bg-white/[.02] p-4 text-xs leading-6 text-slate-400 border border-white/[.05]">
            <strong className="text-white block mb-1">পেমেন্ট করার নিয়ম:</strong>
            ১. আপনার <strong>{method}</strong> অ্যাপে গিয়ে <strong>Send Money</strong> অপশন নির্বাচন করুন।<br />
            ২. ওপরের <strong>{TARGET_NUMBER}</strong> নম্বরে <strong>{course.price}</strong> টাকা পাঠান।<br />
            ৩. পেমেন্ট সফল হলে প্রাপ্ত SMS থেকে <strong>Transaction ID (TrxID)</strong> কপি করে নিচে দিন।
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Payment Verification Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="field-label">যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile Number) *</label>
            <input
              required
              type="tel"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="field"
            />
          </div>

          <div>
            <label className="field-label">ট্রানজেকশন আইডি (Transaction ID / TrxID) *</label>
            <input
              required
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="যেমন: 8N7A2BCX1"
              className="field font-mono uppercase tracking-wider"
            />
            <small className="mt-1 block text-[11px] text-slate-500">
              * সঠিক ৮–১২ অক্ষরের TrxID লিখুন। ডুপ্লিকেট TrxID স্বয়ংক্রিয়ভাবে ব্লক করা হবে।
            </small>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="primary-button mt-4 w-full justify-center !py-3 text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'যাচাই ও সাবমিট হচ্ছে...' : 'পেমেন্ট সাবমিট করুন ও ড্যাশবোর্ডে যান ✓'}
          </button>
        </form>
      </div>
    </main>
  )
}

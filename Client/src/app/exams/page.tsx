'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileCheck2,
  Clock,
  Award,
  Users,
  Search,
  Lock,
  Play,
  Trophy,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Globe,
  X,
  RefreshCw,
} from 'lucide-react'
import { toBengaliNumber } from '../../data/mockData'
import { formatBengaliDuration, formatBengaliNumberDecimal } from '../../lib/examHelpers'
import { apiClient } from '../../lib/apiClient'
import { useAuth } from '../../context/AuthContext'

interface StudentExamItem {
  id: string
  courseId?: string | null
  title: string
  description?: string | null
  durationMinutes: number
  totalMarks: number
  passMarks: number
  negativeMarking: number
  isPublic: boolean
  isEligible: boolean
  requiresLogin: boolean
  course?: {
    id: string
    title: string
    level: 'SSC' | 'HSC'
  } | null
  _count: {
    questions: number
    submissions: number
  }
  mySubmission?: {
    id: string
    status: 'IN_PROGRESS' | 'SUBMITTED'
    totalScore: number
    correctCount: number
    wrongCount: number
    unattemptedCount: number
    timeTakenSeconds: number
    startedAt: string
    submittedAt?: string | null
  } | null
}

export default function ExamsCatalogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [exams, setExams] = useState<StudentExamItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'ALL' | 'FREE' | 'COMPLETED'>('ALL')
  const [confirmExam, setConfirmExam] = useState<StudentExamItem | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadExams = async () => {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      const res = await apiClient.getExams()
      if (res.data?.exams) {
        setExams(res.data.exams)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'পরীক্ষার তালিকা লোড করা যায়নি।')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExams()
  }, [user])

  const filteredExams = exams.filter((exam) => {
    if (filterMode === 'FREE' && !exam.isPublic) return false
    if (filterMode === 'COMPLETED' && exam.mySubmission?.status !== 'SUBMITTED') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        exam.title.toLowerCase().includes(q) ||
        (exam.course?.title || '').toLowerCase().includes(q) ||
        (exam.description || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0c1c16] to-[#07130f] p-7 sm:p-10">
        <div className="pointer-events-none absolute right-0 top-0 -mr-16 -mt-16 size-72 rounded-full bg-[#b7f34a]/10 blur-[80px]" />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/30 bg-[#b7f34a]/10 px-3 py-1 text-xs font-bold text-[#b7f34a]">
              📝 অনলাইন MCQ মডেল টেস্ট ও মেধাতালিকা
            </div>
            <h1 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
              অনলাইন পরীক্ষাসমূহ
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              নির্ধারিত সময়ের মধ্যে MCQ পরীক্ষায় অংশগ্রহণ করে সাথে সাথে ফলাফল, সম্পূর্ণ উত্তরমালা এবং সবার মেধাতালিকায় নিজের অবস্থান দেখো।
            </p>
          </div>

          <button
            onClick={loadExams}
            className="secondary-button self-start md:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>তালিকা রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0c1915] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="বিষয়, অধ্যায় বা পরীক্ষার নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#07110e] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#07110e] p-1">
          {(
            [
              { key: 'ALL', label: 'সব পরীক্ষা' },
              { key: 'FREE', label: 'ফ্রি ওপেন টেস্ট' },
              { key: 'COMPLETED', label: 'আমার দেওয়া পরীক্ষা' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterMode(item.key)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                filterMode === item.key
                  ? 'bg-[#b7f34a] text-[#07110e]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Exams Grid */}
      {isLoading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#0c1915] p-6"
            />
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/[.01] py-20 text-center">
          <FileCheck2 className="mx-auto h-12 w-12 text-slate-600" />
          <h2 className="mt-3 font-display text-lg font-bold text-white">
            কোনো সক্রিয় পরীক্ষা পাওয়া যায়নি
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            নতুন পরীক্ষা যোগ করা হলে এখানে দেখতে পারবেন।
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => {
            const sub = exam.mySubmission
            const isSubmitted = sub?.status === 'SUBMITTED'
            const isInProgress = sub?.status === 'IN_PROGRESS'
            const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

            return (
              <div
                key={exam.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c1915] p-6 transition hover:border-white/20"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {exam.course ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-300">
                        <BookOpen className="h-3 w-3" />
                        {exam.course.level} • {exam.course.title}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                        <Globe className="h-3 w-3" />
                        ফ্রি মডেল টেস্ট
                      </span>
                    )}

                    {isSubmitted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> সম্পন্ন
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 animate-pulse">
                        চলমান
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-white leading-snug">
                    {exam.title}
                  </h3>
                  {exam.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                      {exam.description}
                    </p>
                  )}

                  {/* Specs */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/[.06] bg-white/[.02] p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-[#b7f34a]" />
                      <span>{toBengaliNumber(exam.durationMinutes)} মিনিট</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <FileCheck2 className="h-3.5 w-3.5 text-[#b7f34a]" />
                      <span>{toBengaliNumber(exam._count.questions)} টি প্রশ্ন</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Award className="h-3.5 w-3.5 text-amber-300" />
                      <span>নম্বর: {formatBengaliNumberDecimal(exam.totalMarks)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Users className="h-3.5 w-3.5 text-purple-300" />
                      <span>{toBengaliNumber(exam._count.submissions)} জন দিয়েছে</span>
                    </div>
                  </div>

                  {/* Submitted Score Preview */}
                  {isSubmitted && sub && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[.07] px-3.5 py-2.5 text-xs">
                      <span className="text-emerald-200">তোমার প্রাপ্ত নম্বর:</span>
                      <strong className="font-display text-sm font-black text-[#b7f34a]">
                        {formatBengaliNumberDecimal(sub.totalScore)} /{' '}
                        {formatBengaliNumberDecimal(exam.totalMarks)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-6 border-t border-white/[.08] pt-4">
                  {!user ? (
                    <Link
                      href={`/login?redirect=/exams`}
                      className="primary-button w-full justify-center !py-2.5 text-xs"
                    >
                      লগইন করে পরীক্ষা দিন
                    </Link>
                  ) : isAdminUser ? (
                    <Link
                      href={`/admin/exams/${exam.id}`}
                      className="secondary-button w-full justify-center !py-2.5 text-xs"
                    >
                      অ্যাডমিন প্যানেলে দেখুন
                    </Link>
                  ) : isSubmitted ? (
                    <Link
                      href={`/exams/${exam.id}/result`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#b7f34a]/40 bg-[#b7f34a]/15 py-2.5 text-xs font-bold text-[#b7f34a] transition hover:bg-[#b7f34a] hover:text-[#07110e]"
                    >
                      <Trophy className="h-4 w-4" />
                      ফলাফল, উত্তরমালা ও মেধাতালিকা
                    </Link>
                  ) : isInProgress ? (
                    <Link
                      href={`/exams/${exam.id}/take`}
                      className="primary-button w-full justify-center !py-2.5 text-xs"
                    >
                      <Play className="h-4 w-4" />
                      পরীক্ষা চালিয়ে যান
                    </Link>
                  ) : exam.isEligible ? (
                    <button
                      onClick={() => setConfirmExam(exam)}
                      className="primary-button w-full justify-center !py-2.5 text-xs"
                    >
                      <Play className="h-4 w-4" />
                      পরীক্ষা শুরু করুন
                    </button>
                  ) : (
                    <Link
                      href={exam.courseId ? `/courses/${exam.courseId}` : '/'}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      অংশগ্রহণ করতে কোর্সে ভর্তি হোন
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pre-Exam Briefing Confirmation Modal */}
      {confirmExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c1915] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-[#b7f34a]/15 px-3 py-0.5 text-[11px] font-bold text-[#b7f34a]">
                  পরীক্ষা শুরুর নির্দেশনা
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-white">
                  {confirmExam.title}
                </h3>
              </div>
              <button
                onClick={() => setConfirmExam(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 rounded-2xl border border-white/10 bg-[#07110e] p-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>মোট প্রশ্ন:</span>
                <strong className="text-white">{toBengaliNumber(confirmExam._count.questions)} টি</strong>
              </div>
              <div className="flex justify-between">
                <span>মোট সময়:</span>
                <strong className="text-[#b7f34a]">
                  {formatBengaliDuration(confirmExam.durationMinutes * 60)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>মোট নম্বর:</span>
                <strong className="text-white">{formatBengaliNumberDecimal(confirmExam.totalMarks)}</strong>
              </div>
              <div className="flex justify-between">
                <span>ভুল উত্তরের জন্য কর্তন (নেগেটিভ):</span>
                <strong className="text-rose-300">
                  -{formatBengaliNumberDecimal(confirmExam.negativeMarking)} প্রতি ভুল
                </strong>
              </div>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-amber-200/90">
              ⚠️ পরীক্ষা শুরু করার সাথে সাথেই কাউন্টডাউন টাইমার চলতে শুরু করবে। নির্ধারিত সময় শেষ হলে পরীক্ষাটি স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে এবং সাথে সাথেই ফলাফল ও মেধাতালিকা দেখা যাবে।
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmExam(null)}
                className="secondary-button !py-2.5 text-xs"
              >
                ফিরে যান
              </button>
              <button
                onClick={() => {
                  const id = confirmExam.id
                  setConfirmExam(null)
                  router.push(`/exams/${id}/take`)
                }}
                className="primary-button !py-2.5 text-xs"
              >
                <Play className="h-4 w-4" />
                এখনই শুরু করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

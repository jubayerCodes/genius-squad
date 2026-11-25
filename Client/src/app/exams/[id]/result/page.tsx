'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  ListChecks,
  ArrowLeft,
  RefreshCw,
  MinusCircle,
  BookOpen,
} from 'lucide-react'
import { toBengaliNumber } from '../../../../data/mockData'
import {
  formatBengaliDuration,
  formatBengaliNumberDecimal,
  getOptionLabel,
} from '../../../../lib/examHelpers'
import { apiClient } from '../../../../lib/apiClient'
import ProtectedRoute from '../../../../components/ProtectedRoute'

interface AnswerSheetItem {
  id: string
  question: string
  options: string[]
  correctOption: number
  selectedOption: number | null
  isCorrect: boolean
  explanation?: string | null
  marks: number
}

interface LeaderboardEntry {
  rank: number
  userId: string
  studentName: string
  institution: string
  district: string
  totalScore: number
  totalQuestions: number
  correctCount: number
  wrongCount: number
  unattemptedCount: number
  timeTakenSeconds: number
  submittedAt: string | null
  isCurrentUser: boolean
}

interface ExamResultData {
  exam: {
    id: string
    title: string
    description?: string | null
    durationMinutes: number
    totalMarks: number
    passMarks: number
    negativeMarking: number
    course?: { id: string; title: string; level: string } | null
  }
  result: {
    totalScore: number
    totalQuestions: number
    correctCount: number
    wrongCount: number
    unattemptedCount: number
    timeTakenSeconds: number
    passed: boolean
    accuracy: number
    rank: number | null
    totalParticipants: number
  }
  answerSheet: AnswerSheetItem[]
  leaderboard: LeaderboardEntry[]
}

function ExamResultContent({ examId }: { examId: string }) {
  const [data, setData] = useState<ExamResultData | null>(null)
  const [activeTab, setActiveTab] = useState<'answers' | 'leaderboard'>('answers')
  const [answerFilter, setAnswerFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadResult = async () => {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      const res = await apiClient.getExamResult(examId)
      if (res.data) {
        setData(res.data)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'ফলাফল লোড করা যায়নি।')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResult()
  }, [examId])

  if (isLoading && !data) {
    return (
      <main className="mx-auto max-w-[1100px] px-5 py-24 text-center">
        <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[#b7f34a]" />
        <p className="mt-4 text-sm text-slate-300">ফলাফল ও মেধাতালিকা লোড হচ্ছে...</p>
      </main>
    )
  }

  if (errorMsg || !data) {
    return (
      <main className="mx-auto max-w-[700px] px-5 py-20 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8">
          <h1 className="font-display text-xl font-bold text-white">ফলাফল পাওয়া যায়নি</h1>
          <p className="mt-2 text-xs text-rose-200">{errorMsg}</p>
          <Link href="/exams" className="primary-button mt-6 inline-flex">
            পরীক্ষা তালিকায় ফিরে যান
          </Link>
        </div>
      </main>
    )
  }

  const { exam, result, answerSheet, leaderboard } = data

  const filteredQuestions = answerSheet.filter((q) => {
    if (answerFilter === 'CORRECT') return q.isCorrect
    if (answerFilter === 'WRONG') return q.selectedOption !== null && !q.isCorrect
    if (answerFilter === 'SKIPPED') return q.selectedOption === null
    return true
  })

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          সব পরীক্ষায় ফিরে যান
        </Link>

        <button onClick={loadResult} className="secondary-button !py-2 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>মেধাতালিকা রিফ্রেশ করুন</span>
        </button>
      </div>

      {/* Scorecard Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1c16] via-[#0a1713] to-[#07110e] p-6 sm:p-9">
        <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 size-80 rounded-full bg-[#b7f34a]/10 blur-[90px]" />

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  result.passed
                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border border-amber-500/40 bg-amber-500/15 text-amber-300'
                }`}
              >
                {result.passed ? '🎉 উত্তীর্ণ (Passed)' : '📚 আরও অনুশীলন প্রয়োজন'}
              </span>
              {exam.course && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  <BookOpen className="h-3 w-3" />
                  {exam.course.title}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl">
              {exam.title}
            </h1>
            <p className="mt-1.5 text-xs text-slate-400">
              নেগেটিভ মার্কিং: -{formatBengaliNumberDecimal(exam.negativeMarking)} • সময় নিয়েছেন:{' '}
              <strong className="text-white">{formatBengaliDuration(result.timeTakenSeconds)}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-[#b7f34a]/30 bg-[#b7f34a]/10 px-6 py-4 text-center">
              <span className="block text-[11px] font-semibold text-[#b7f34a]">তোমার স্কোর</span>
              <strong className="mt-1 block font-display text-3xl font-black text-white">
                {formatBengaliNumberDecimal(result.totalScore)}
                <span className="text-base font-semibold text-slate-400">
                  {' '}
                  / {formatBengaliNumberDecimal(exam.totalMarks)}
                </span>
              </strong>
            </div>

            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-6 py-4 text-center">
              <span className="block text-[11px] font-semibold text-amber-300">মেধাক্রম (Rank)</span>
              <strong className="mt-1 block font-display text-3xl font-black text-white">
                {result.rank ? `${toBengaliNumber(result.rank)}ম` : '—'}
                <span className="text-sm font-semibold text-slate-400">
                  {' '}
                  / {toBengaliNumber(result.totalParticipants)}
                </span>
              </strong>
            </div>
          </div>
        </div>

        {/* Stat Breakdown */}
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.06] p-4">
            <span className="text-xs text-emerald-300">সঠিক উত্তর</span>
            <strong className="mt-1 block font-display text-2xl font-black text-white">
              {toBengaliNumber(result.correctCount)} টি
            </strong>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[.06] p-4">
            <span className="text-xs text-rose-300">ভুল উত্তর</span>
            <strong className="mt-1 block font-display text-2xl font-black text-white">
              {toBengaliNumber(result.wrongCount)} টি
            </strong>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <span className="text-xs text-slate-400">উত্তর দেওয়া হয়নি</span>
            <strong className="mt-1 block font-display text-2xl font-black text-white">
              {toBengaliNumber(result.unattemptedCount)} টি
            </strong>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[.06] p-4">
            <span className="text-xs text-blue-300">সঠিকতার হার</span>
            <strong className="mt-1 block font-display text-2xl font-black text-white">
              {toBengaliNumber(result.accuracy)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs: Answer Sheet vs Leaderboard */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0c1915] p-1.5">
          <button
            onClick={() => setActiveTab('answers')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'answers'
                ? 'bg-[#b7f34a] text-[#07110e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListChecks className="h-4 w-4" />
            উত্তরমালা ও সমাধান ({toBengaliNumber(answerSheet.length)})
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'leaderboard'
                ? 'bg-[#b7f34a] text-[#07110e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4" />
            মেধাতালিকা / Leaderboard ({toBengaliNumber(leaderboard.length)})
          </button>
        </div>

        {activeTab === 'answers' && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#0c1915] p-1">
            {(
              [
                { key: 'ALL', label: 'সব' },
                { key: 'CORRECT', label: '✓ সঠিক' },
                { key: 'WRONG', label: '✕ ভুল' },
                { key: 'SKIPPED', label: '− স্কিপড' },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setAnswerFilter(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  answerFilter === f.key
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: Official Answer Sheet & Solutions */}
      {activeTab === 'answers' ? (
        <div className="mt-6 space-y-5">
          {filteredQuestions.map((q, idx) => {
            const isSkipped = q.selectedOption === null
            return (
              <div
                key={q.id}
                className={`rounded-2xl border bg-[#0c1915] p-6 ${
                  q.isCorrect
                    ? 'border-emerald-500/30'
                    : isSkipped
                    ? 'border-white/10'
                    : 'border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white">
                      {toBengaliNumber(idx + 1)}
                    </span>
                    <p className="text-sm font-bold leading-relaxed text-white sm:text-base">
                      {q.question}
                    </p>
                  </div>

                  <span
                    className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                      q.isCorrect
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : isSkipped
                        ? 'bg-white/10 text-slate-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {q.isCorrect ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> সঠিক (+{formatBengaliNumberDecimal(q.marks)})
                      </>
                    ) : isSkipped ? (
                      <>
                        <MinusCircle className="h-3.5 w-3.5" /> উত্তর দেননি
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> ভুল (-{formatBengaliNumberDecimal(exam.negativeMarking)})
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {q.options.map((opt, oIdx) => {
                    const isOfficialCorrect = oIdx === q.correctOption
                    const isStudentChoice = oIdx === q.selectedOption

                    let style = 'border-white/10 bg-[#07110e] text-slate-300'
                    if (isOfficialCorrect) {
                      style = 'border-emerald-500/60 bg-emerald-500/15 font-bold text-emerald-200'
                    } else if (isStudentChoice && !isOfficialCorrect) {
                      style = 'border-rose-500/60 bg-rose-500/15 font-bold text-rose-200'
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs ${style}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                              isOfficialCorrect
                                ? 'bg-emerald-500 text-black'
                                : isStudentChoice
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {getOptionLabel(oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px]">
                          {isStudentChoice && (
                            <span className="rounded bg-white/15 px-1.5 py-0.5 font-semibold text-white">
                              তোমার উত্তর
                            </span>
                          )}
                          {isOfficialCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/[.06] px-4 py-3 text-xs leading-relaxed text-blue-200">
                    <strong className="text-blue-300">ব্যাখ্যা ও সমাধান: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* TAB 2: Live Leaderboard */
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0c1915]">
          {leaderboard.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              এখনো মেধাতালিকায় কোনো তথ্য নেই।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#07110e] text-slate-400">
                    <th className="py-3.5 pl-6 pr-4 font-semibold">মেধাক্রম</th>
                    <th className="py-3.5 px-4 font-semibold">শিক্ষার্থী ও প্রতিষ্ঠান</th>
                    <th className="py-3.5 px-4 font-semibold">প্রাপ্ত নম্বর</th>
                    <th className="py-3.5 px-4 font-semibold">সঠিক / ভুল</th>
                    <th className="py-3.5 px-4 font-semibold">সময় নিয়েছে</th>
                    <th className="py-3.5 px-6 text-right font-semibold">সাবমিটের সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[.06]">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={`transition ${
                        entry.isCurrentUser
                          ? 'bg-[#b7f34a]/10'
                          : 'hover:bg-white/[.02]'
                      }`}
                    >
                      <td className="py-4 pl-6 pr-4 font-display text-sm font-black text-white">
                        {entry.rank === 1
                          ? '🥇 ১ম'
                          : entry.rank === 2
                          ? '🥈 ২য়'
                          : entry.rank === 3
                          ? '🥉 ৩য়'
                          : `#${toBengaliNumber(entry.rank)}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{entry.studentName}</span>
                              {entry.isCurrentUser && (
                                <span className="rounded-full bg-[#b7f34a] px-2 py-0.5 text-[10px] font-black text-[#07110e]">
                                  তুমি
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {entry.institution} {entry.district ? `• ${entry.district}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#b7f34a]/15 px-2.5 py-1 font-display text-xs font-black text-[#b7f34a]">
                          <Award className="h-3.5 w-3.5" />
                          {formatBengaliNumberDecimal(entry.totalScore)} /{' '}
                          {formatBengaliNumberDecimal(exam.totalMarks)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-emerald-400 font-semibold">
                          ✓ {toBengaliNumber(entry.correctCount)}
                        </span>{' '}
                        <span className="text-slate-500">/</span>{' '}
                        <span className="text-rose-400 font-semibold">
                          ✕ {toBengaliNumber(entry.wrongCount)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          {formatBengaliDuration(entry.timeTakenSeconds)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-[11px] text-slate-400">
                        {entry.submittedAt
                          ? new Date(entry.submittedAt).toLocaleString('bn-BD')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <ExamResultContent examId={id} />
    </ProtectedRoute>
  )
}

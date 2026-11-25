'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  CheckCircle2,
  Flag,
  AlertTriangle,
  Send,
  RefreshCw,
  Eraser,
} from 'lucide-react'
import { toBengaliNumber } from '../../../../data/mockData'
import {
  formatBengaliNumberDecimal,
  formatTimerDisplay,
  getOptionLabel,
} from '../../../../lib/examHelpers'
import { apiClient } from '../../../../lib/apiClient'
import { useAuth } from '../../../../context/AuthContext'
import ProtectedRoute from '../../../../components/ProtectedRoute'

interface ExamQuestionPublic {
  id: string
  question: string
  options: string[]
  marks: number
  orderIndex: number
}

interface ActiveExamMeta {
  id: string
  title: string
  description?: string | null
  durationMinutes: number
  totalMarks: number
  passMarks: number
  negativeMarking: number
  questionCount: number
  course?: {
    id: string
    title: string
    level: string
  } | null
}

function TakeExamContent({ examId }: { examId: string }) {
  const router = useRouter()
  const { user } = useAuth()

  const [exam, setExam] = useState<ActiveExamMeta | null>(null)
  const [questions, setQuestions] = useState<ExamQuestionPublic[]>([])
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [markedIds, setMarkedIds] = useState<string[]>([])
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const answersRef = useRef<Record<string, number | null>>({})
  const hasAutoSubmittedRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const endTimestampRef = useRef<number | null>(null)

  const draftStorageKey = user ? `gs_exam_draft_${examId}_${user.id}` : null

  useEffect(() => {
    answersRef.current = answers
    if (draftStorageKey && Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(draftStorageKey, JSON.stringify(answers))
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [answers, draftStorageKey])

  const submitFinalAnswers = useCallback(
    async (isAuto = false) => {
      if (isSubmittingRef.current) return
      if (isAuto && hasAutoSubmittedRef.current) return
      isSubmittingRef.current = true
      if (isAuto) hasAutoSubmittedRef.current = true

      try {
        setIsSubmitting(true)
        setSubmitError(null)
        setIsConfirmModalOpen(false)
        await apiClient.submitExam(examId, answersRef.current)
        if (draftStorageKey) {
          try {
            localStorage.removeItem(draftStorageKey)
          } catch {
            // Ignore
          }
        }
        router.replace(`/exams/${examId}/result`)
      } catch (err: any) {
        isSubmittingRef.current = false
        setIsSubmitting(false)
        hasAutoSubmittedRef.current = false
        setSubmitError(err?.message || 'পরীক্ষা সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
      }
    },
    [examId, router, draftStorageKey]
  )

  useEffect(() => {
    let mounted = true
    const initExam = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        const res = await apiClient.startExam(examId)
        if (!mounted) return

        if (res.data?.alreadySubmitted) {
          router.replace(`/exams/${examId}/result`)
          return
        }

        if (res.data?.exam && res.data?.questions) {
          setExam(res.data.exam)
          setQuestions(res.data.questions)

          const serverDraft = res.data.draftAnswers || {}
          let localDraft: Record<string, number | null> = {}
          if (draftStorageKey) {
            try {
              const saved = localStorage.getItem(draftStorageKey)
              if (saved) localDraft = JSON.parse(saved)
            } catch {
              localDraft = {}
            }
          }

          const merged = { ...serverDraft, ...localDraft }
          setAnswers(merged)
          answersRef.current = merged

          const rem = typeof res.data.remainingSeconds === 'number'
            ? res.data.remainingSeconds
            : res.data.exam.durationMinutes * 60

          endTimestampRef.current = Date.now() + rem * 1000
          setRemainingSeconds(rem)
        }
      } catch (err: any) {
        if (mounted) {
          setLoadError(err?.message || 'পরীক্ষা শুরু করা যায়নি।')
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initExam()
    return () => {
      mounted = false
    }
  }, [examId, router, draftStorageKey])

  // Wall-clock accurate countdown timer
  useEffect(() => {
    if (remainingSeconds === null || endTimestampRef.current === null) return

    const timer = setInterval(() => {
      if (!endTimestampRef.current) return
      const left = Math.max(0, Math.round((endTimestampRef.current - Date.now()) / 1000))
      setRemainingSeconds(left)

      if (left <= 0) {
        clearInterval(timer)
        submitFinalAnswers(true)
      }
    }, 500)

    return () => clearInterval(timer)
  }, [remainingSeconds !== null, submitFinalAnswers])

  // Periodic background draft sync (every 20s)
  useEffect(() => {
    if (!exam || isSubmitting) return

    const syncInterval = setInterval(() => {
      if (Object.keys(answersRef.current).length > 0) {
        apiClient.syncExamDraft(examId, answersRef.current).catch(() => {})
      }
    }, 20000)

    return () => clearInterval(syncInterval)
  }, [exam, examId, isSubmitting])

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleClearOption = (questionId: string) => {
    setAnswers((prev) => {
      const copy = { ...prev }
      delete copy[questionId]
      return copy
    })
  }

  const toggleMarkQuestion = (questionId: string) => {
    setMarkedIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    )
  }

  const scrollToQuestion = (qId: string) => {
    const el = document.getElementById(`question-${qId}`)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1000px] px-5 py-24 text-center">
        <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[#b7f34a]" />
        <p className="mt-4 text-sm text-slate-300">পরীক্ষার প্রশ্নপত্র ও টাইমার প্রস্তুত হচ্ছে...</p>
      </main>
    )
  }

  if (loadError || !exam) {
    return (
      <main className="mx-auto max-w-[700px] px-5 py-20 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-400" />
          <h1 className="mt-4 font-display text-xl font-bold text-white">
            পরীক্ষায় প্রবেশ করা যাচ্ছে না
          </h1>
          <p className="mt-2 text-xs text-rose-200">{loadError || 'অজানা ত্রুটি ঘটেছে।'}</p>
          <Link href="/exams" className="primary-button mt-6 inline-flex">
            পরীক্ষা তালিকায় ফিরে যান
          </Link>
        </div>
      </main>
    )
  }

  const answeredCount = questions.filter(
    (q) => typeof answers[q.id] === 'number'
  ).length
  const isCriticalTime = remainingSeconds !== null && remainingSeconds <= 60
  const isWarningTime = remainingSeconds !== null && remainingSeconds > 60 && remainingSeconds <= 180

  return (
    <main className="mx-auto max-w-[1240px] px-5 pb-20 pt-6 lg:px-8">
      {/* Sticky Live Timer Bar */}
      <div className="sticky top-[78px] z-40 mb-8 rounded-2xl border border-white/10 bg-[#0c1915]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-base font-bold text-white sm:text-lg">
              {exam.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span>
                উত্তর দেওয়া হয়েছে:{' '}
                <strong className="text-[#b7f34a]">
                  {toBengaliNumber(answeredCount)} / {toBengaliNumber(questions.length)}
                </strong>
              </span>
              <span>•</span>
              <span>নেগেটিভ মার্ক: -{formatBengaliNumberDecimal(exam.negativeMarking)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Countdown Badge */}
            <div
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-base font-black ${
                isCriticalTime
                  ? 'animate-pulse border-rose-500/60 bg-rose-500/20 text-rose-300'
                  : isWarningTime
                  ? 'border-amber-400/50 bg-amber-400/15 text-amber-300'
                  : 'border-[#b7f34a]/40 bg-[#b7f34a]/10 text-[#b7f34a]'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>
                {remainingSeconds !== null ? formatTimerDisplay(remainingSeconds) : '00:00'}
              </span>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsConfirmModalOpen(true)}
              className="primary-button !px-4 !py-2.5 text-xs disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {submitError}
        </div>
      )}

      {/* Main Content Grid: Questions + Navigator */}
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Question List */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const selectedOpt = answers[q.id]
            const isMarked = markedIds.includes(q.id)

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className={`rounded-2xl border bg-[#0c1915] p-6 transition ${
                  isMarked
                    ? 'border-amber-400/40'
                    : typeof selectedOpt === 'number'
                    ? 'border-[#b7f34a]/30'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#b7f34a]/15 font-display text-xs font-black text-[#b7f34a]">
                      {toBengaliNumber(idx + 1)}
                    </span>
                    <div>
                      <p className="text-sm font-bold leading-relaxed text-white sm:text-base">
                        {q.question}
                      </p>
                      <span className="mt-1 inline-block text-[11px] text-slate-400">
                        মান: {formatBengaliNumberDecimal(q.marks)} নম্বর
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {typeof selectedOpt === 'number' && (
                      <button
                        type="button"
                        onClick={() => handleClearOption(q.id)}
                        title="উত্তর মুছুন"
                        className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white"
                      >
                        <Eraser className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleMarkQuestion(q.id)}
                      title="রিভিউ এর জন্য চিহ্নিত করুন"
                      className={`rounded-lg border p-1.5 transition ${
                        isMarked
                          ? 'border-amber-400/50 bg-amber-400/15 text-amber-300'
                          : 'border-white/10 text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      <Flag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-xs font-medium transition sm:text-sm ${
                          isSelected
                            ? 'border-[#b7f34a] bg-[#b7f34a]/15 font-bold text-white shadow-inner'
                            : 'border-white/10 bg-[#07110e] text-slate-300 hover:border-white/25 hover:bg-white/[.03]'
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isSelected
                              ? 'bg-[#b7f34a] text-[#07110e]'
                              : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {getOptionLabel(optIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#b7f34a]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Bottom Submit CTA */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0c1915] p-6">
            <div className="text-xs text-slate-400">
              সবগুলো উত্তর যাচাই করা হয়ে গেলে নিচের বাটনে ক্লিক করে সাবমিট করুন।
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsConfirmModalOpen(true)}
              className="primary-button !px-6 !py-3 text-xs"
            >
              <Send className="h-4 w-4" />
              <span>পরীক্ষা সাবমিট করুন</span>
            </button>
          </div>
        </div>

        {/* Sticky Question Palette */}
        <aside className="hidden lg:block">
          <div className="sticky top-[175px] rounded-2xl border border-white/10 bg-[#0c1915] p-5">
            <h2 className="font-display text-sm font-bold text-white">প্রশ্ন নেভিগেটর</h2>
            <p className="mt-1 text-[11px] text-slate-400">
              যেকোনো নম্বরে ক্লিক করে প্রশ্নে যান
            </p>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = typeof answers[q.id] === 'number'
                const isMarked = markedIds.includes(q.id)

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => scrollToQuestion(q.id)}
                    className={`flex h-9 w-full items-center justify-center rounded-lg border text-xs font-bold transition ${
                      isMarked
                        ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                        : isAnswered
                        ? 'border-[#b7f34a] bg-[#b7f34a] text-[#07110e]'
                        : 'border-white/10 bg-[#07110e] text-slate-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {toBengaliNumber(idx + 1)}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-[#b7f34a]" />
                <span>উত্তর দেওয়া হয়েছে ({toBengaliNumber(answeredCount)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-amber-400 bg-amber-400/20" />
                <span>রিভিউ চিহ্নিত ({toBengaliNumber(markedIds.length)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-white/20 bg-[#07110e]" />
                <span>বাকি আছে ({toBengaliNumber(questions.length - answeredCount)})</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c1915] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">
              পরীক্ষা সাবমিট নিশ্চিতকরণ
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              সাবমিট করার পর উত্তর পরিবর্তন করা যাবে না। সাথে সাথেই ফলাফল, উত্তরমালা ও মেধাতালিকা দেখতে পাবেন।
            </p>

            <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-[#07110e] p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">মোট প্রশ্ন:</span>
                <strong className="text-white">{toBengaliNumber(questions.length)} টি</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">উত্তর দিয়েছেন:</span>
                <strong className="text-[#b7f34a]">{toBengaliNumber(answeredCount)} টি</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">উত্তর দেননি:</span>
                <strong className="text-amber-300">
                  {toBengaliNumber(questions.length - answeredCount)} টি
                </strong>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="secondary-button !py-2.5 text-xs"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => submitFinalAnswers(false)}
                className="primary-button !py-2.5 text-xs disabled:opacity-50"
              >
                {isSubmitting ? 'মূল্যায়ন হচ্ছে...' : 'সাবমিট ও ফলাফল দেখুন ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <TakeExamContent examId={id} />
    </ProtectedRoute>
  )
}

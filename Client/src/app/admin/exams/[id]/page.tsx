'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Clock,
  Award,
  Trophy,
  ListChecks,
  RefreshCw,
  X,
  Check,
  Upload,
} from 'lucide-react'
import { toBengaliNumber } from '../../../../data/mockData'
import {
  formatBengaliDuration,
  formatBengaliNumberDecimal,
  getOptionLabel,
} from '../../../../lib/examHelpers'
import { apiClient } from '../../../../lib/apiClient'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import AdminNav from '../../../../components/AdminNav'

interface ExamQuestionItem {
  id: string
  question: string
  options: string[]
  correctOption: number
  explanation?: string | null
  marks: number
  orderIndex: number
}

interface AdminExamDetail {
  id: string
  title: string
  description?: string | null
  durationMinutes: number
  totalMarks: number
  passMarks: number
  negativeMarking: number
  isPublic: boolean
  isActive: boolean
  course?: { id: string; title: string; level: string } | null
  questions: ExamQuestionItem[]
  _count?: {
    questions: number
    submissions: number
  }
}

interface LeaderboardRow {
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
}

function AdminExamDetailContent({ examId }: { examId: string }) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'leaderboard' ? 'leaderboard' : 'questions'

  const [activeTab, setActiveTab] = useState<'questions' | 'leaderboard'>(initialTab)
  const [exam, setExam] = useState<AdminExamDetail | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Question builder form state
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestionItem | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<string[]>(['', '', '', ''])
  const [correctOption, setCorrectOption] = useState<number | null>(null)
  const [explanation, setExplanation] = useState('')
  const [marks, setMarks] = useState<string>('1')
  const [isSavingQuestion, setIsSavingQuestion] = useState(false)

  // Bulk JSON modal
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkJson, setBulkJson] = useState('')
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [isBulkSaving, setIsBulkSaving] = useState(false)

  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(t)
    }
  }, [notification])

  const loadExamData = async () => {
    try {
      setIsLoading(true)
      const [examRes, lbRes] = await Promise.all([
        apiClient.getAdminExam(examId),
        apiClient.getExamLeaderboard(examId),
      ])
      if (examRes.data?.exam) {
        setExam(examRes.data.exam)
      }
      if (lbRes.data?.entries) {
        setLeaderboard(lbRes.data.entries)
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'পরীক্ষার তথ্য লোড করা যায়নি।',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExamData()
  }, [examId])

  const resetQuestionForm = () => {
    setEditingQuestion(null)
    setQuestionText('')
    setOptions(['', '', '', ''])
    setCorrectOption(null)
    setExplanation('')
    setMarks('1')
  }

  const startEditQuestion = (q: ExamQuestionItem) => {
    setEditingQuestion(q)
    setQuestionText(q.question)
    const padded = [...q.options]
    while (padded.length < 4) padded.push('')
    setOptions(padded.slice(0, 4))
    setCorrectOption(q.correctOption)
    setExplanation(q.explanation || '')
    setMarks(String(q.marks || 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)))
  }

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedOptions = options.map((o) => o.trim())
    if (questionText.trim().length < 2) {
      setNotification({ type: 'error', text: 'প্রশ্নটি কমপক্ষে ২ অক্ষরের হতে হবে।' })
      return
    }
    if (trimmedOptions.some((o) => o.length === 0)) {
      setNotification({ type: 'error', text: 'সকল ৪টি অপশন (ক, খ, গ, ঘ) পূরণ করা আবশ্যক।' })
      return
    }
    if (correctOption === null || correctOption < 0 || correctOption >= trimmedOptions.length) {
      setNotification({
        type: 'error',
        text: 'অবশ্যই উত্তরমালা (Answer Sheet) হিসেবে সঠিক উত্তরটি চিহ্নিত করুন।',
      })
      return
    }

    const numericMarks = Number(marks)
    if (!numericMarks || numericMarks <= 0) {
      setNotification({ type: 'error', text: 'প্রশ্নের নম্বর ০-এর বেশি হতে হবে।' })
      return
    }

    const payload = {
      question: questionText.trim(),
      options: trimmedOptions,
      correctOption,
      explanation: explanation.trim() || null,
      marks: numericMarks,
    }

    try {
      setIsSavingQuestion(true)
      if (editingQuestion) {
        await apiClient.updateExamQuestion(examId, editingQuestion.id, payload)
        setNotification({ type: 'success', text: 'প্রশ্ন ও উত্তরমালা আপডেট করা হয়েছে।' })
      } else {
        await apiClient.addExamQuestion(examId, payload)
        setNotification({ type: 'success', text: 'নতুন প্রশ্ন ও উত্তরমালা যুক্ত করা হয়েছে।' })
      }
      resetQuestionForm()
      await loadExamData()
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'প্রশ্ন সংরক্ষণ করা যায়নি।',
      })
    } finally {
      setIsSavingQuestion(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await apiClient.deleteExamQuestion(examId, questionId)
      setNotification({ type: 'success', text: 'প্রশ্নটি মুছে ফেলা হয়েছে।' })
      if (editingQuestion?.id === questionId) {
        resetQuestionForm()
      }
      await loadExamData()
    } catch (err: any) {
      setNotification({ type: 'error', text: err?.message || 'প্রশ্নটি মুছে ফেলা যায়নি।' })
    }
  }

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setBulkError(null)
    try {
      const parsed = JSON.parse(bulkJson)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setBulkError('JSON ফরম্যাটে একটি নন-এম্পটি প্রশ্ন অ্যারে দিন।')
        return
      }
      setIsBulkSaving(true)
      await apiClient.bulkAddExamQuestions(examId, parsed)
      setIsBulkOpen(false)
      setBulkJson('')
      setNotification({
        type: 'success',
        text: `${toBengaliNumber(parsed.length)} টি প্রশ্ন একসাথে যুক্ত করা হয়েছে।`,
      })
      await loadExamData()
    } catch (err: any) {
      setBulkError(err?.message || 'সঠিক JSON ফরম্যাট দিন।')
    } finally {
      setIsBulkSaving(false)
    }
  }

  if (isLoading && !exam) {
    return (
      <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
        <AdminNav />
        <div className="py-24 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b7f34a]" />
          <p className="mt-3 text-sm text-slate-400">পরীক্ষার তথ্য লোড হচ্ছে...</p>
        </div>
      </main>
    )
  }

  if (!exam) {
    return (
      <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
        <AdminNav />
        <div className="rounded-3xl border border-[#232d38] bg-[#131b24] p-12 text-center">
          <h2 className="font-display text-xl font-bold text-white">পরীক্ষাটি খুঁজে পাওয়া যায়নি</h2>
          <Link href="/admin/exams" className="primary-button mt-6 inline-flex">
            সব পরীক্ষায় ফিরে যান
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
      <AdminNav />

      <Link
        href="/admin/exams"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        সব পরীক্ষায় ফিরে যান
      </Link>

      {/* Exam Header Card */}
      <div className="rounded-3xl border border-[#232d38] bg-[#131b24] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {exam.course && (
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-[11px] font-bold text-blue-300">
                  {exam.course.level} • {exam.course.title}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                  exam.isActive
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                }`}
              >
                {exam.isActive ? '🟢 চালু' : '⏸️ বন্ধ'}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl">
              {exam.title}
            </h1>
            {exam.description && (
              <p className="mt-1.5 text-xs text-slate-400">{exam.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-center">
              <span className="block text-[10px] text-slate-400">সময়</span>
              <strong className="font-display text-sm font-bold text-[#b7f34a]">
                {toBengaliNumber(exam.durationMinutes)} মি.
              </strong>
            </div>
            <div className="rounded-2xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-center">
              <span className="block text-[10px] text-slate-400">মোট প্রশ্ন</span>
              <strong className="font-display text-sm font-bold text-white">
                {toBengaliNumber(exam.questions.length)} টি
              </strong>
            </div>
            <div className="rounded-2xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-center">
              <span className="block text-[10px] text-slate-400">মোট নম্বর</span>
              <strong className="font-display text-sm font-bold text-white">
                {formatBengaliNumberDecimal(exam.totalMarks)}
              </strong>
            </div>
            <div className="rounded-2xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-center">
              <span className="block text-[10px] text-slate-400">নেগেটিভ মার্ক</span>
              <strong className="font-display text-sm font-bold text-rose-300">
                -{formatBengaliNumberDecimal(exam.negativeMarking)}
              </strong>
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#232d38] pt-5">
          <div className="flex items-center gap-2 rounded-xl bg-[#0c1218] p-1">
            <button
              onClick={() => setActiveTab('questions')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === 'questions'
                  ? 'bg-[#b7f34a] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListChecks className="h-4 w-4" />
              প্রশ্ন ও উত্তরমালা ({toBengaliNumber(exam.questions.length)})
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === 'leaderboard'
                  ? 'bg-[#b7f34a] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="h-4 w-4" />
              মেধাতালিকা ({toBengaliNumber(leaderboard.length)})
            </button>
          </div>

          {activeTab === 'questions' && (
            <button
              onClick={() => {
                setBulkError(null)
                setIsBulkOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2 text-xs font-semibold text-slate-300 hover:border-[#b7f34a]/50 hover:text-white transition"
            >
              <Upload className="h-4 w-4 text-[#b7f34a]" />
              <span>বাল্ক JSON ইম্পোর্ট</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mt-6 flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-semibold ${
            notification.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TAB 1: Questions & Answer Sheet Builder */}
      {activeTab === 'questions' ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Question Form */}
          <div className="h-fit rounded-3xl border border-[#232d38] bg-[#131b24] p-6">
            <div className="flex items-center justify-between border-b border-[#232d38] pb-4">
              <h2 className="font-display text-lg font-bold text-white">
                {editingQuestion ? 'প্রশ্ন ও উত্তরমালা সম্পাদনা' : '+ নতুন প্রশ্ন যোগ করুন'}
              </h2>
              {editingQuestion && (
                <button
                  onClick={resetQuestionForm}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            <form onSubmit={handleSaveQuestion} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  প্রশ্ন লিখুন *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="যেমন: নিউটনের গতির দ্বিতীয় সূত্র কোনটি?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    অপশন ও সঠিক উত্তর (Answer Sheet) *
                  </label>
                  <span className="text-[11px] text-[#b7f34a]">
                    সঠিক অপশনের বাম পাশে ক্লিক করে টিক দিন
                  </span>
                </div>

                <div className="space-y-2.5">
                  {options.map((opt, idx) => {
                    const isCorrect = correctOption === idx
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 rounded-xl border p-2 transition ${
                          isCorrect
                            ? 'border-emerald-400 bg-emerald-500/10'
                            : 'border-[#232d38] bg-[#0c1218]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCorrectOption(idx)}
                          title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition ${
                            isCorrect
                              ? 'border-emerald-400 bg-emerald-500 text-black'
                              : 'border-[#232d38] bg-[#131b24] text-slate-400 hover:border-emerald-400/50 hover:text-emerald-300'
                          }`}
                        >
                          {isCorrect ? <Check className="h-4 w-4" /> : getOptionLabel(idx)}
                        </button>
                        <input
                          type="text"
                          required
                          placeholder={`অপশন ${getOptionLabel(idx)} লিখুন...`}
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                        {isCorrect && (
                          <span className="flex-shrink-0 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            সঠিক উত্তর
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    প্রশ্নের নম্বর
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white focus:border-[#b7f34a] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    সমাধান ও ব্যাখ্যা (Answer Key Note - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: F = ma অনুযায়ী বল হলো ভর ও ত্বরণের গুণফল।"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingQuestion}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b7f34a] py-3 text-xs font-bold text-black shadow-lg shadow-[#b7f34a]/15 hover:bg-[#c5f965] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {isSavingQuestion
                    ? 'সংরক্ষণ হচ্ছে...'
                    : editingQuestion
                    ? 'প্রশ্ন ও উত্তরমালা আপডেট করুন'
                    : 'প্রশ্ন ও উত্তরমালা যোগ করুন'}
                </span>
              </button>
            </form>
          </div>

          {/* Saved Questions & Answer Key List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">
                সংযুক্ত প্রশ্ন ও উত্তরমালা ({toBengaliNumber(exam.questions.length)} টি)
              </h2>
            </div>

            {exam.questions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#232d38] bg-[#131b24]/50 p-12 text-center">
                <ListChecks className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 text-sm font-semibold text-white">এখনো কোনো প্রশ্ন যোগ করা হয়নি</p>
                <p className="mt-1 text-xs text-slate-400">
                  বাম পাশের ফর্ম ব্যবহার করে MCQ প্রশ্ন ও সঠিক উত্তরমালা যোগ করুন।
                </p>
              </div>
            ) : (
              exam.questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-[#232d38] bg-[#131b24] p-5 transition hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#b7f34a]/15 text-xs font-black text-[#b7f34a]">
                        {toBengaliNumber(qIdx + 1)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white leading-relaxed">{q.question}</p>
                        <span className="mt-1 inline-block text-[11px] text-slate-400">
                          নম্বর: {formatBengaliNumberDecimal(q.marks)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditQuestion(q)}
                        title="সম্পাদনা"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1e2a38] hover:text-white"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        title="মুছে ফেলুন"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => {
                      const isAnswer = oIdx === q.correctOption
                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                            isAnswer
                              ? 'border-emerald-500/40 bg-emerald-500/10 font-bold text-emerald-300'
                              : 'border-[#232d38] bg-[#0c1218] text-slate-300'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[11px] font-bold ${
                              isAnswer ? 'bg-emerald-500 text-black' : 'bg-[#182029] text-slate-400'
                            }`}
                          >
                            {getOptionLabel(oIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isAnswer && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        </div>
                      )
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/[.05] px-3.5 py-2.5 text-[11px] text-blue-200">
                      <strong className="text-blue-300">ব্যাখ্যা: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: Live Leaderboard */
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#232d38] bg-[#131b24]">
          {leaderboard.length === 0 ? (
            <div className="py-20 text-center">
              <Trophy className="mx-auto h-12 w-12 text-slate-600" />
              <h3 className="mt-3 font-display text-base font-bold text-white">
                এখনো কোনো শিক্ষার্থী পরীক্ষা দেয়নি
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                শিক্ষার্থীরা পরীক্ষা সাবমিট করলে এখানে স্বয়ংক্রিয়ভাবে মেধাতালিকা তৈরি হবে।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#232d38] bg-[#0e151d] text-slate-400">
                    <th className="py-3.5 pl-6 pr-4 font-semibold">মেধাক্রম</th>
                    <th className="py-3.5 px-4 font-semibold">শিক্ষার্থী ও প্রতিষ্ঠান</th>
                    <th className="py-3.5 px-4 font-semibold">প্রাপ্ত নম্বর</th>
                    <th className="py-3.5 px-4 font-semibold">সঠিক / ভুল / স্কিপ</th>
                    <th className="py-3.5 px-4 font-semibold">সময় নিয়েছে</th>
                    <th className="py-3.5 px-6 text-right font-semibold">জমার সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2833]">
                  {leaderboard.map((row) => (
                    <tr key={row.userId} className="hover:bg-[#182330]">
                      <td className="py-4 pl-6 pr-4 font-display text-sm font-black text-white">
                        {row.rank === 1
                          ? '🥇 ১ম'
                          : row.rank === 2
                          ? '🥈 ২য়'
                          : row.rank === 3
                          ? '🥉 ৩য়'
                          : `#${toBengaliNumber(row.rank)}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{row.studentName}</span>
                          <span className="text-[11px] text-slate-400">
                            {row.institution} {row.district ? `• ${row.district}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#b7f34a]/15 px-2.5 py-1 font-display text-xs font-black text-[#b7f34a]">
                          <Award className="h-3.5 w-3.5" />
                          {formatBengaliNumberDecimal(row.totalScore)} /{' '}
                          {formatBengaliNumberDecimal(exam.totalMarks)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold">
                          <span className="text-emerald-400">✓ {toBengaliNumber(row.correctCount)}</span>
                          <span className="text-rose-400">✕ {toBengaliNumber(row.wrongCount)}</span>
                          <span className="text-slate-400">− {toBengaliNumber(row.unattemptedCount)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          {formatBengaliDuration(row.timeTakenSeconds)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-[11px] text-slate-400">
                        {row.submittedAt
                          ? new Date(row.submittedAt).toLocaleString('bn-BD')
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

      {/* Bulk JSON Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-[#232d38] bg-[#131b24] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232d38] pb-4">
              <h3 className="font-display text-base font-bold text-white">
                বাল্ক JSON প্রশ্ন ও উত্তরমালা ইম্পোর্ট
              </h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {bulkError && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {bulkError}
              </div>
            )}

            <form onSubmit={handleBulkImport} className="mt-4 space-y-4">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                নিচের ফরম্যাট অনুযায়ী JSON অ্যারে পেস্ট করুন (<code className="text-[#b7f34a]">correctOption</code> ০-ভিত্তিক: ক=0, খ=1, গ=2, ঘ=3):
              </p>
              <textarea
                rows={10}
                required
                placeholder={`[\n  {\n    "question": "বেগের একক কোনটি?",\n    "options": ["m/s", "m/s²", "Newton", "Joule"],\n    "correctOption": 0,\n    "explanation": "সরণের পরিবর্তনের হারকে বেগ বলে (m/s)।",\n    "marks": 1\n  }\n]`}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] p-4 font-mono text-xs text-white placeholder-slate-600 focus:border-[#b7f34a] focus:outline-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="rounded-xl border border-[#232d38] px-4 py-2 text-xs font-semibold text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isBulkSaving}
                  className="rounded-xl bg-[#b7f34a] px-5 py-2 text-xs font-bold text-black hover:bg-[#c5f965] disabled:opacity-50"
                >
                  {isBulkSaving ? 'ইম্পোর্ট হচ্ছে...' : 'সব প্রশ্ন ইম্পোর্ট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default function AdminExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminExamDetailContent examId={id} />
    </ProtectedRoute>
  )
}

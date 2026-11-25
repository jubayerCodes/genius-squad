'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileCheck2,
  Plus,
  Search,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  X,
  Trophy,
  ListChecks,
  Globe,
  BookOpen,
} from 'lucide-react'
import { toBengaliNumber } from '../../../data/mockData'
import { formatBengaliNumberDecimal } from '../../../lib/examHelpers'
import { apiClient } from '../../../lib/apiClient'
import ProtectedRoute from '../../../components/ProtectedRoute'
import AdminNav from '../../../components/AdminNav'

interface AdminExamRecord {
  id: string
  courseId?: string | null
  title: string
  description?: string | null
  durationMinutes: number
  totalMarks: number
  passMarks: number
  negativeMarking: number
  isPublic: boolean
  isActive: boolean
  createdAt: string
  course?: {
    id: string
    title: string
    level: 'SSC' | 'HSC'
  } | null
  _count?: {
    questions: number
    submissions: number
  }
}

interface CourseOption {
  id: string
  title: string
  level: 'SSC' | 'HSC'
}

interface ExamFormState {
  title: string
  courseId: string
  description: string
  durationMinutes: number | string
  passMarks: number | string
  negativeMarking: number | string
  isPublic: boolean
  isActive: boolean
}

const initialExamForm: ExamFormState = {
  title: '',
  courseId: '',
  description: '',
  durationMinutes: 20,
  passMarks: 8,
  negativeMarking: 0.25,
  isPublic: false,
  isActive: true,
}

function AdminExamsContent() {
  const router = useRouter()
  const [exams, setExams] = useState<AdminExamRecord[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<AdminExamRecord | null>(null)
  const [formData, setFormData] = useState<ExamFormState>(initialExamForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deletingExam, setDeletingExam] = useState<AdminExamRecord | null>(null)
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

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [examsRes, coursesRes] = await Promise.all([
        apiClient.getAdminExams(),
        apiClient.getAdminCourses(),
      ])
      if (examsRes.data?.exams) {
        setExams(examsRes.data.exams)
      }
      if (coursesRes.data?.courses) {
        setCourses(coursesRes.data.courses)
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err?.message || 'পরীক্ষা তালিকা লোড করা যায়নি।',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredExams = exams.filter((exam) => {
    if (statusFilter === 'ACTIVE' && !exam.isActive) return false
    if (statusFilter === 'PAUSED' && exam.isActive) return false

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

  const openCreateModal = () => {
    setEditingExam(null)
    setFormData(initialExamForm)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (exam: AdminExamRecord) => {
    setEditingExam(exam)
    setFormData({
      title: exam.title,
      courseId: exam.courseId || '',
      description: exam.description || '',
      durationMinutes: exam.durationMinutes,
      passMarks: exam.passMarks,
      negativeMarking: exam.negativeMarking,
      isPublic: exam.isPublic,
      isActive: exam.isActive,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const duration = Number(formData.durationMinutes)
    const passMarks = Number(formData.passMarks || 0)
    const negativeMarking = Number(formData.negativeMarking || 0)

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setFormError('পরীক্ষার শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে।')
      return
    }
    if (!Number.isInteger(duration) || duration < 1 || duration > 300) {
      setFormError('পরীক্ষার সময় ১ থেকে ৩০০ মিনিটের মধ্যে পূর্ণ সংখ্যা হতে হবে।')
      return
    }

    const payload = {
      title: formData.title.trim(),
      courseId: formData.courseId.trim() || null,
      description: formData.description.trim() || null,
      durationMinutes: duration,
      passMarks,
      negativeMarking,
      isPublic: formData.courseId.trim() ? formData.isPublic : true,
      isActive: formData.isActive,
    }

    try {
      setIsSubmitting(true)
      if (editingExam) {
        await apiClient.updateExam(editingExam.id, payload)
        setNotification({ type: 'success', text: 'পরীক্ষার তথ্য সফলভাবে আপডেট হয়েছে।' })
        setIsModalOpen(false)
        await loadData()
      } else {
        const res = await apiClient.createExam(payload)
        setIsModalOpen(false)
        if (res.data?.exam?.id) {
          router.push(`/admin/exams/${res.data.exam.id}`)
          return
        }
        setNotification({
          type: 'success',
          text: 'নতুন পরীক্ষা তৈরি হয়েছে! এবার প্রশ্ন ও উত্তরমালা যোগ করুন।',
        })
        await loadData()
      }
    } catch (err: any) {
      setFormError(err?.message || 'পরীক্ষা সংরক্ষণ করা যায়নি।')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (exam: AdminExamRecord) => {
    try {
      await apiClient.updateExam(exam.id, { isActive: !exam.isActive })
      setNotification({
        type: 'success',
        text: !exam.isActive
          ? `"${exam.title}" পরীক্ষাটি চালু করা হয়েছে।`
          : `"${exam.title}" পরীক্ষাটি সাময়িকভাবে বন্ধ করা হয়েছে।`,
      })
      await loadData()
    } catch (err: any) {
      setNotification({ type: 'error', text: err?.message || 'স্ট্যাটাস পরিবর্তন করা যায়নি।' })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingExam) return
    try {
      await apiClient.deleteExam(deletingExam.id)
      setDeletingExam(null)
      setNotification({ type: 'success', text: 'পরীক্ষাটি সফলভাবে মুছে ফেলা হয়েছে।' })
      await loadData()
    } catch (err: any) {
      setNotification({ type: 'error', text: err?.message || 'পরীক্ষা মুছে ফেলা যায়নি।' })
    }
  }

  const totalExams = exams.length
  const activeExams = exams.filter((e) => e.isActive).length
  const totalQuestions = exams.reduce((acc, e) => acc + (e._count?.questions || 0), 0)
  const totalParticipants = exams.reduce((acc, e) => acc + (e._count?.submissions || 0), 0)

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/30 bg-[#b7f34a]/10 px-3 py-1 text-xs font-bold text-[#b7f34a]">
            📝 MCQ এক্সাম কন্ট্রোল সেন্টার
          </div>
          <h1 className="mt-3 font-display text-3xl font-black text-white">
            পরীক্ষা ম্যানেজমেন্ট
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            MCQ পরীক্ষা তৈরি করুন, সময় নির্ধারণ করুন, প্রশ্ন ও উত্তরমালা যোগ করুন এবং মেধাতালিকা দেখুন।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-[#232d38] bg-[#131b24] px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-[#182029] hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#b7f34a] px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#b7f34a]/15 transition-all hover:bg-[#c5f965]"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন পরীক্ষা তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Toast */}
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
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[.04] p-5">
          <span className="text-xs font-semibold text-blue-300">মোট পরীক্ষা</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(totalExams)} টি
          </strong>
          <span className="mt-1 block text-[11px] text-blue-300/70">ডাটাবেজে সংরক্ষিত</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.04] p-5">
          <span className="text-xs font-semibold text-emerald-300">চালু পরীক্ষা</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(activeExams)} টি
          </strong>
          <span className="mt-1 block text-[11px] text-emerald-300/70">শিক্ষার্থীদের জন্য উন্মুক্ত</span>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[.04] p-5">
          <span className="text-xs font-semibold text-amber-300">মোট প্রশ্ন</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(totalQuestions)} টি
          </strong>
          <span className="mt-1 block text-[11px] text-amber-300/70">উত্তরমালা সহ</span>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[.04] p-5">
          <span className="text-xs font-semibold text-purple-300">মোট পরীক্ষার্থী</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(totalParticipants)} বার
          </strong>
          <span className="mt-1 block text-[11px] text-purple-300/70">সাবমিট হওয়া পরীক্ষা</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#232d38] bg-[#131b24] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="পরীক্ষার নাম বা কোর্স দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#0c1218] p-1">
          {(
            [
              { key: 'ALL', label: 'সব পরীক্ষা' },
              { key: 'ACTIVE', label: '🟢 চালু' },
              { key: 'PAUSED', label: '⏸️ বন্ধ' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === item.key
                  ? 'bg-[#1e2a38] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#232d38] bg-[#131b24]">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b7f34a]" />
            <p className="mt-3 text-sm text-slate-400">পরীক্ষার তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-20 text-center">
            <FileCheck2 className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-3 font-display text-base font-bold text-white">কোনো পরীক্ষা পাওয়া যায়নি</h3>
            <p className="mt-1 text-xs text-slate-400">নতুন পরীক্ষা তৈরি করে MCQ প্রশ্ন ও উত্তরমালা যোগ করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#232d38] bg-[#0e151d] text-slate-400">
                  <th className="py-3.5 pl-6 pr-4 font-semibold">পরীক্ষা ও কোর্স</th>
                  <th className="py-3.5 px-4 font-semibold">সময় ও নম্বর</th>
                  <th className="py-3.5 px-4 font-semibold">প্রশ্ন ও উত্তরমালা</th>
                  <th className="py-3.5 px-4 font-semibold">অংশগ্রহণ</th>
                  <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-6 text-right font-semibold">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2833]">
                {filteredExams.map((exam) => {
                  const qCount = exam._count?.questions || 0
                  const subCount = exam._count?.submissions || 0

                  return (
                    <tr key={exam.id} className="transition-colors hover:bg-[#182330]">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/admin/exams/${exam.id}`}
                            className="font-display text-sm font-bold text-white hover:text-[#b7f34a] transition"
                          >
                            {exam.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            {exam.course ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-blue-300">
                                <BookOpen className="h-3 w-3" />
                                {exam.course.title}
                              </span>
                            ) : null}
                            {exam.isPublic ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                                <Globe className="h-3 w-3" />
                                সবার জন্য উন্মুক্ত
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-amber-300">
                                এনরোল করা শিক্ষার্থী
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                            <Clock className="h-3.5 w-3.5 text-[#b7f34a]" />
                            {toBengaliNumber(exam.durationMinutes)} মিনিট
                          </span>
                          <span className="text-[11px] text-slate-400">
                            মোট: {formatBengaliNumberDecimal(exam.totalMarks)} | নেগেটিভ: -{formatBengaliNumberDecimal(exam.negativeMarking)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/exams/${exam.id}`}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                            qCount === 0
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                              : 'border-[#b7f34a]/30 bg-[#b7f34a]/10 text-[#b7f34a] hover:bg-[#b7f34a]/20'
                          }`}
                        >
                          <ListChecks className="h-3.5 w-3.5" />
                          <span>
                            {qCount === 0
                              ? 'প্রশ্ন যোগ করুন (০ টি)'
                              : `${toBengaliNumber(qCount)} টি প্রশ্ন ও উত্তর`}
                          </span>
                        </Link>
                      </td>

                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/exams/${exam.id}?tab=leaderboard`}
                          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#b7f34a]"
                        >
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-semibold">{toBengaliNumber(subCount)} জন</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActive(exam)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                            exam.isActive
                              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                              : 'border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                          }`}
                        >
                          {exam.isActive ? (
                            <>
                              <Play className="h-3 w-3" /> চালু
                            </>
                          ) : (
                            <>
                              <Pause className="h-3 w-3" /> বন্ধ
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/exams/${exam.id}?tab=leaderboard`}
                            title="মেধাতালিকা দেখুন"
                            className="rounded-lg p-2 text-slate-400 hover:bg-[#1e2a38] hover:text-amber-300"
                          >
                            <Trophy className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(exam)}
                            title="তথ্য সম্পাদনা করুন"
                            className="rounded-lg p-2 text-slate-400 hover:bg-[#1e2a38] hover:text-white"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingExam(exam)}
                            title="মুছে ফেলুন"
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-[#232d38] bg-[#131b24] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232d38] pb-4">
              <h2 className="font-display text-lg font-bold text-white">
                {editingExam ? 'পরীক্ষার সেটিংস আপডেট' : 'নতুন MCQ পরীক্ষা তৈরি করুন'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-[#1e2a38] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveExam} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  পরীক্ষার শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: SSC ২০২৫ পদার্থবিজ্ঞান - গতিবিদ্যা মডেল টেস্ট ০১"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  সংশ্লিষ্ট কোর্স (ঐচ্ছিক)
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white focus:border-[#b7f34a] focus:outline-none"
                >
                  <option value="">কোর্স ছাড়া (সকল নিবন্ধিত শিক্ষার্থীর জন্য উন্মুক্ত)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.level} • {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    পরীক্ষার সময় (মিনিট) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white focus:border-[#b7f34a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    পাস মার্কস
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: e.target.value })}
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white focus:border-[#b7f34a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    নেগেটিভ মার্কিং (ভুল প্রতি)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min={0}
                    max={5}
                    value={formData.negativeMarking}
                    onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.value })}
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white focus:border-[#b7f34a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  সিলেবাস ও নির্দেশাবলী (ঐচ্ছিক)
                </label>
                <textarea
                  rows={3}
                  placeholder="অধ্যায়ের নাম, পরীক্ষার্থীদের জন্য নির্দেশনা লিখুন..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2.5 rounded-2xl border border-[#232d38] bg-[#0c1218] p-4">
                {formData.courseId && (
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="h-4 w-4 rounded border-[#232d38] bg-[#131b24] accent-[#b7f34a]"
                    />
                    <span>কোর্সে ভর্তি না হওয়া শিক্ষার্থীরাও ফ্রি ডেমো হিসেবে দিতে পারবে</span>
                  </label>
                )}

                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-[#232d38] bg-[#131b24] accent-[#b7f34a]"
                  />
                  <span>পরীক্ষাটি চালু রাখুন (কমপক্ষে ১টি প্রশ্ন যোগ করলেই শিক্ষার্থীরা দেখতে পারবে)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#232d38] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#182029]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#b7f34a] px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#b7f34a]/15 hover:bg-[#c5f965] disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'সংরক্ষণ হচ্ছে...'
                    : editingExam
                    ? 'আপডেট করুন'
                    : 'তৈরি করুন ও প্রশ্ন যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#232d38] bg-[#131b24] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">পরীক্ষা মুছে ফেলার নিশ্চিতকরণ</h3>
                <span className="text-xs text-slate-400">"{deletingExam.title}"</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              এই পরীক্ষাটি মুছে ফেললে এর সকল প্রশ্ন, উত্তরমালা ও শিক্ষার্থীর ফলাফল স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingExam(null)}
                className="rounded-xl border border-[#232d38] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#182029]"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-600"
              >
                স্থায়ীভাবে মুছুন
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function AdminExamsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminExamsContent />
    </ProtectedRoute>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Pause,
  Play,
  Edit3,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ExternalLink,
  Users,
  RefreshCw,
  X,
  Layers,
  CheckSquare,
  Square,
  Link as LinkIcon,
} from 'lucide-react'
import { Course, toBengaliNumber, parseBengaliPrice } from '../../../data/mockData'
import { apiClient } from '../../../lib/apiClient'
import ProtectedRoute from '../../../components/ProtectedRoute'
import AdminNav from '../../../components/AdminNav'

interface AdminCourseData extends Course {
  updatedAt?: string
  createdAt?: string
}

interface CourseFormData {
  id?: string
  title: string
  subtitle: string
  level: 'SSC' | 'HSC'
  price: number | string
  oldPrice: number | string
  subjects: string
  services: string
  privateGroupUrl: string
  thumbnailUrl: string
  isActive: boolean
}

const initialFormState: CourseFormData = {
  title: '',
  subtitle: '',
  level: 'SSC',
  price: '',
  oldPrice: '',
  subjects: '',
  services: 'লাইভ ক্লাস, প্রাকটিস এক্সাম, পার্সোনাল মেন্টরশিপ, লেকচার শিট',
  privateGroupUrl: '',
  thumbnailUrl: '',
  isActive: true,
}

function AdminCoursesContent() {
  const [courses, setCourses] = useState<AdminCourseData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'SSC' | 'HSC'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<AdminCourseData | null>(null)
  const [formData, setFormData] = useState<CourseFormData>(initialFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Image Upload states
  const [imageUploadType, setImageUploadType] = useState<'UPLOAD' | 'URL'>('UPLOAD')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete modals
  const [deletingCourse, setDeletingCourse] = useState<AdminCourseData | null>(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)

  // Auto-dismiss notification
  useEffect(() => {
    if (actionNotification) {
      const timer = setTimeout(() => setActionNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [actionNotification])

  // Load courses from backend
  const loadCourses = async () => {
    try {
      setIsLoading(true)
      const res = await apiClient.getAdminCourses()
      if (res.data?.courses) {
        setCourses(res.data.courses)
      }
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'কোর্স তালিকা লোড করা যায়নি।',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  // Filtered courses
  const filteredCourses = courses.filter((course) => {
    if (levelFilter !== 'ALL' && course.level !== levelFilter) return false
    if (statusFilter === 'ACTIVE' && course.isActive === false) return false
    if (statusFilter === 'PAUSED' && course.isActive !== false) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = course.title?.toLowerCase().includes(q)
      const subMatch = course.subtitle?.toLowerCase().includes(q)
      const idMatch = course.id?.toLowerCase().includes(q)
      const subjectMatch = Array.isArray(course.subjects) && course.subjects.some((s) => s.toLowerCase().includes(q))
      return titleMatch || subMatch || idMatch || subjectMatch
    }

    return true
  })

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredCourses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCourses.map((c) => c.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCourse(null)
    setFormData(initialFormState)
    setFormError(null)
    setUploadError(null)
    setImageUploadType('UPLOAD')
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (course: AdminCourseData) => {
    setEditingCourse(course)
    setFormData({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      level: course.level,
      price: course.rawPrice || course.price,
      oldPrice: course.oldPrice ? String(course.oldPrice).replace(/[^\d]/g, '') : '',
      subjects: Array.isArray(course.subjects) ? course.subjects.join(', ') : '',
      services: Array.isArray(course.features)
        ? course.features.join(', ')
        : (course as any).services?.join(', ') || '',
      privateGroupUrl: course.privateGroupUrl || '',
      thumbnailUrl: course.thumbnailUrl || '',
      isActive: course.isActive !== false,
    })
    setFormError(null)
    setUploadError(null)
    setImageUploadType(course.thumbnailUrl?.startsWith('http') ? 'URL' : 'UPLOAD')
    setIsModalOpen(true)
  }

  // Image file change handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsUploadingImage(true)

    try {
      const res = await apiClient.uploadCourseImage(file)
      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: res.data.url }))
      }
    } catch (err: any) {
      setUploadError(err?.message || 'ছবি আপলোড ব্যর্থ হয়েছে।')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Form submission (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.title.trim()) {
      setFormError('কোর্সের শিরোনাম প্রদান করুন।')
      return
    }
    if (!formData.subtitle.trim()) {
      setFormError('কোর্সের সংক্ষিপ্ত বিবরণ প্রদান করুন।')
      return
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('কোর্সের সঠিক মূল্য নির্ধারণ করুন।')
      return
    }
    if (!formData.privateGroupUrl.trim()) {
      setFormError('ফেসবুক প্রাইভেট গ্রুপ লিংক প্রদান করুন।')
      return
    }

    const subjectsArray = formData.subjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (subjectsArray.length === 0) {
      setFormError('কমপক্ষে একটি বিষয় (Subject) উল্লেখ করুন।')
      return
    }

    const servicesArray = formData.services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload = {
      ...(formData.id ? { id: formData.id.trim() } : {}),
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      level: formData.level,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : Number(formData.price),
      subjects: subjectsArray,
      services: servicesArray.length > 0 ? servicesArray : ['লাইভ ক্লাস', 'মেন্টরশিপ'],
      privateGroupUrl: formData.privateGroupUrl.trim(),
      thumbnailUrl: formData.thumbnailUrl.trim() || null,
      isActive: formData.isActive,
    }

    try {
      setIsSubmitting(true)
      if (editingCourse) {
        await apiClient.updateCourse(editingCourse.id, payload)
        setActionNotification({
          type: 'success',
          text: `"${payload.title}" কোর্স সফলভাবে আপডেট করা হয়েছে।`,
        })
      } else {
        await apiClient.createCourse(payload)
        setActionNotification({
          type: 'success',
          text: `"${payload.title}" নতুন কোর্স সফলভাবে তৈরি করা হয়েছে।`,
        })
      }

      setIsModalOpen(false)
      await loadCourses()
    } catch (err: any) {
      setFormError(err?.message || 'কোর্স সেভ করা সম্ভব হয়নি।')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle single course active status (Pause / Resume)
  const handleToggleStatus = async (course: AdminCourseData) => {
    try {
      const nextStatus = course.isActive === false
      await apiClient.toggleCourseStatus(course.id, nextStatus)
      setActionNotification({
        type: 'success',
        text: nextStatus
          ? `"${course.title}" কোর্সটি পুনরায় চালু করা হয়েছে।`
          : `"${course.title}" কোর্সটি সাময়িকভাবে পজ করা হয়েছে।`,
      })
      await loadCourses()
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'কোর্স স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।',
      })
    }
  }

  // Delete single course
  const handleConfirmDelete = async () => {
    if (!deletingCourse) return

    try {
      const res = await apiClient.deleteCourse(deletingCourse.id)
      setDeletingCourse(null)
      setActionNotification({
        type: res.data?.paused ? 'info' : 'success',
        text: res.message || 'কোর্স মুছে ফেলা হয়েছে।',
      })
      setSelectedIds((prev) => prev.filter((id) => id !== deletingCourse.id))
      await loadCourses()
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'কোর্স মুছে ফেলা সম্ভব হয়নি।',
      })
    }
  }

  // Bulk actions
  const handleBulkStatus = async (nextStatus: boolean) => {
    if (selectedIds.length === 0) return

    try {
      for (const id of selectedIds) {
        await apiClient.toggleCourseStatus(id, nextStatus)
      }
      setActionNotification({
        type: 'success',
        text: `নির্বাচিত ${toBengaliNumber(selectedIds.length)} টি কোর্স সফলভাবে ${nextStatus ? 'চালু' : 'পজ'} করা হয়েছে।`,
      })
      setSelectedIds([])
      await loadCourses()
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'বাল্ক স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।',
      })
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      const res = await apiClient.bulkDeleteCourses(selectedIds)
      setIsBulkDeleteModalOpen(false)
      setSelectedIds([])
      setActionNotification({
        type: 'info',
        text: res.message || 'বাল্ক অপারেশন সম্পন্ন হয়েছে।',
      })
      await loadCourses()
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'বাল্ক ডিলিট ব্যর্থ হয়েছে।',
      })
    }
  }

  // Stats calculation
  const totalCoursesCount = courses.length
  const activeCoursesCount = courses.filter((c) => c.isActive !== false).length
  const pausedCoursesCount = courses.filter((c) => c.isActive === false).length
  const totalStudentsEnrolled = courses.reduce(
    (sum, c) => sum + (c._count?.enrollments || 0),
    0
  )

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
      {/* Top Admin Navigation Tabs */}
      <AdminNav />

      {/* Notification Toast */}
      {actionNotification && (
        <div
          className={`mb-6 flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-medium shadow-xl transition-all ${
            actionNotification.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : actionNotification.type === 'info'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionNotification.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            {actionNotification.type === 'info' && <AlertCircle className="h-5 w-5 text-amber-400" />}
            {actionNotification.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
            <span>{actionNotification.text}</span>
          </div>
          <button
            onClick={() => setActionNotification(null)}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Course Management Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/30 bg-[#b7f34a]/10 px-3 py-1 text-xs font-bold text-[#b7f34a]">
            📚 কোর্স কন্ট্রোল সেন্টার
          </div>
          <h1 className="mt-2 font-display text-3xl font-black text-white">
            কোর্স ম্যানেজমেন্ট
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            নতুন কোর্স তৈরি করুন, থাম্বনেইল ছবি আপলোড করুন, ব্যাচ পজ বা চালু রাখুন এবং বিবরণ পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCourses}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#232d38] bg-[#182029] px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-[#202b37] hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#b7f34a] px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#b7f34a]/20 transition-all hover:bg-[#cbf968]"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন কোর্স যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[.04] p-5">
          <span className="text-xs font-semibold text-blue-300">মোট কোর্স</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(totalCoursesCount)} টি
          </strong>
          <span className="mt-1 block text-[11px] text-blue-300/70">ক্যাটালগে নিবন্ধিত</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.04] p-5">
          <span className="text-xs font-semibold text-emerald-300">ভর্তি চালু কোর্স</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(activeCoursesCount)} টি
          </strong>
          <span className="mt-1 block text-[11px] text-emerald-300/70">পাবলিকভাবে দৃশ্যমান</span>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[.04] p-5">
          <span className="text-xs font-semibold text-amber-300">পজ করা কোর্স</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(pausedCoursesCount)} টি
          </strong>
          <span className="mt-1 block text-[11px] text-amber-300/70">ভর্তি সাময়িক স্থগিত</span>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[.04] p-5">
          <span className="text-xs font-semibold text-purple-300">মোট ভর্তি শিক্ষার্থী</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(totalStudentsEnrolled)} জন
          </strong>
          <span className="mt-1 block text-[11px] text-purple-300/70">সব ব্যাচ মিলিয়ে</span>
        </div>
      </div>

      {/* Search, Filter & Bulk Action Toolbar */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-[#232d38] bg-[#131b24] p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="কোর্সের নাম, লেভেল বা বিষয় দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#0c1218] p-1">
            {(['ALL', 'SSC', 'HSC'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  levelFilter === level
                    ? 'bg-[#1e2a38] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {level === 'ALL' ? 'সব লেভেল' : level}
              </button>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#0c1218] p-1">
            {(
              [
                { key: 'ALL', label: 'সব স্ট্যাটাস' },
                { key: 'ACTIVE', label: '🟢 চালু' },
                { key: 'PAUSED', label: '⏸️ পজ' },
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

        {/* Bulk Action Strip (Visible when items selected) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#b7f34a]/30 bg-[#b7f34a]/10 p-3.5">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#b7f34a]" />
              <span className="text-xs font-bold text-white">
                {toBengaliNumber(selectedIds.length)} টি কোর্স সিলেক্ট করা হয়েছে
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
              >
                <Play className="h-3.5 w-3.5" />
                <span>সব চালু করুন</span>
              </button>

              <button
                onClick={() => handleBulkStatus(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>সব পজ করুন</span>
              </button>

              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>বাল্ক ডিলিট</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                বাতিল
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courses Data Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#232d38] bg-[#131b24]">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b7f34a]" />
            <p className="mt-3 text-sm text-slate-400">কোর্স তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-3 font-display text-base font-bold text-white">কোন কোর্স পাওয়া যায়নি</h3>
            <p className="mt-1 text-xs text-slate-400">ফিল্টার পরিবর্তন করুন অথবা নতুন কোর্স যুক্ত করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#232d38] bg-[#0e151d] text-slate-400">
                  <th className="w-12 py-3.5 pl-4 pr-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-white"
                    >
                      {selectedIds.length === filteredCourses.length && filteredCourses.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-[#b7f34a]" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 font-semibold">থাম্বনেইল ও কোর্স</th>
                  <th className="py-3.5 px-4 font-semibold">লেভেল</th>
                  <th className="py-3.5 px-4 font-semibold">মূল্য</th>
                  <th className="py-3.5 px-4 font-semibold">ভর্তি শিক্ষার্থী</th>
                  <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-right font-semibold">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2833]">
                {filteredCourses.map((course) => {
                  const isSelected = selectedIds.includes(course.id)
                  const isPaused = course.isActive === false
                  const enrollmentsCount = course._count?.enrollments || 0
                  const displayPrice = course.rawPrice || course.price

                  return (
                    <tr
                      key={course.id}
                      className={`transition-colors hover:bg-[#182330] ${
                        isSelected ? 'bg-[#1a2938]/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-4 pr-2">
                        <button
                          onClick={() => handleToggleSelect(course.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-[#b7f34a]" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Thumbnail & Title */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#232d38] bg-[#0c1218]">
                            <img
                              src={course.thumbnailUrl || '/assets/course-study.jpg'}
                              alt={course.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.onerror = null
                                target.src = '/assets/course-study.jpg'
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-display text-sm font-bold text-white hover:text-[#b7f34a]">
                              {course.title}
                            </span>
                            <p className="line-clamp-1 text-[11px] text-slate-400">
                              {course.subtitle}
                            </p>
                            <span className="mt-0.5 inline-block text-[10px] text-slate-500 font-mono">
                              ID: {course.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                            course.level === 'SSC'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {course.level}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-semibold text-white">
                        <div className="flex items-baseline gap-2">
                          <span className="text-emerald-400 font-bold">
                            ৳{typeof displayPrice === 'number' ? toBengaliNumber(displayPrice) : displayPrice}
                          </span>
                          {course.oldPrice && (
                            <span className="text-[11px] text-slate-500 line-through">
                              ৳{course.oldPrice}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Enrolled Students */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-bold text-white">
                            {toBengaliNumber(enrollmentsCount)} জন
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(course)}
                          title={isPaused ? 'চালু করতে ক্লিক করুন' : 'পজ করতে ক্লিক করুন'}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                            isPaused
                              ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                              : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          {isPaused ? (
                            <>
                              <Pause className="h-3 w-3" />
                              <span>⏸️ পজ করা</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              <span>🟢 চালু</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(course)}
                            title="সম্পাদনা করুন"
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#202b37] hover:text-white"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(course)}
                            title={isPaused ? 'চালু করুন' : 'পজ করুন'}
                            className={`rounded-lg p-2 transition-colors ${
                              isPaused
                                ? 'text-amber-400 hover:bg-amber-400/10'
                                : 'text-emerald-400 hover:bg-emerald-400/10'
                            }`}
                          >
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={() => setDeletingCourse(course)}
                            title="মুছে ফেলুন"
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
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

      {/* ============================================================ */}
      {/* Create / Edit Course Modal                                   */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#232d38] bg-[#131b24] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232d38] pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  {editingCourse ? 'কোর্স তথ্য সম্পাদনা করুন' : 'নতুন কোর্স তৈরি করুন'}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  সঠিক তথ্য প্রদান করে কোর্সটি সক্রিয় রাখুন।
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-[#1f2937] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="mt-6 space-y-4">
              {/* Title & Subtitle */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  কোর্সের শিরোনাম (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Final Revision Batch 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  সাবটাইটেল / সংক্ষিপ্ত বিবরণ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: এসএসসি শিক্ষার্থীদের জন্য শেষ মুহূর্তের গোছানো প্রস্তুতি"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                />
              </div>

              {/* Level, Price, Old Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    লেভেল (Level) *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value as 'SSC' | 'HSC' })
                    }
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white focus:border-[#b7f34a] focus:outline-none"
                  >
                    <option value="SSC">SSC (এসএসসি)</option>
                    <option value="HSC">HSC (এইচএসসি)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    বর্তমান ফি / মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="যেমন: 2490"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    পূর্বের মূল্য (৳ - ঐচ্ছিক)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: 4500"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                  />
                </div>
              </div>

              {/* Subjects & Services */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  বিষয়সমূহ (কমা দিয়ে আলাদা করুন) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  কোর্সের সুবিধাসমূহ / ফিচার (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ৮০+ লাইভ ক্লাস, ২০টি মডেল টেস্ট, ডাউট সলভিং গ্রুপ"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                />
              </div>

              {/* Facebook Private Group URL */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  ফেসবুক প্রাইভেট গ্রুপ লিংক *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://facebook.com/groups/..."
                  value={formData.privateGroupUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, privateGroupUrl: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                />
                <span className="mt-1 block text-[10px] text-slate-500">
                  পেমেন্ট অনুমোদিত হলে শিক্ষার্থী তার ড্যাশবোর্ডে এই লিংক দেখতে পারবে।
                </span>
              </div>

              {/* Custom Course ID / Slug (Only on create) */}
              {!editingCourse && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    কাস্টম কোর্স আইডি / স্লাগ (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: hsc-physics-crash-course (খালি রাখলে স্বয়ংক্রিয় হবে)"
                    value={formData.id || ''}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none font-mono"
                  />
                </div>
              )}

              {/* =================================================== */}
              {/* Course Thumbnail Image System                       */}
              {/* =================================================== */}
              <div className="rounded-2xl border border-[#232d38] bg-[#0c1218] p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">
                    কোর্স ব্যানার / থাম্বনেইল ছবি
                  </label>
                  <div className="flex items-center gap-1 rounded-lg bg-[#182029] p-0.5">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('UPLOAD')}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        imageUploadType === 'UPLOAD'
                          ? 'bg-[#b7f34a] text-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      কম্পিউটার থেকে আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('URL')}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        imageUploadType === 'URL'
                          ? 'bg-[#b7f34a] text-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      সরাসরি ইমেজ লিংক
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <p className="mt-2 text-[11px] text-rose-400">{uploadError}</p>
                )}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Image Preview Box */}
                  <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-[#232d38] bg-[#131b24]">
                    <img
                      src={formData.thumbnailUrl || '/assets/course-study.jpg'}
                      alt="Thumbnail Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src = '/assets/course-study.jpg'
                      }}
                    />
                    {formData.thumbnailUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-slate-300 hover:text-white"
                        title="ছবি রিমুভ করুন"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Input Mechanism */}
                  <div className="flex-1">
                    {imageUploadType === 'UPLOAD' ? (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageFileChange}
                          className="hidden"
                          id="course-image-upload"
                        />
                        <label
                          htmlFor="course-image-upload"
                          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#2b3745] bg-[#131b24] p-3 text-center transition-colors hover:border-[#b7f34a] hover:bg-[#182330]"
                        >
                          <UploadCloud className="h-5 w-5 text-slate-400" />
                          <span className="mt-1 text-xs font-semibold text-slate-300">
                            {isUploadingImage ? 'আপলোড হচ্ছে...' : 'ক্লিক করে ছবি সিলেক্ট করুন'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            JPG, PNG, WebP (সর্বোচ্চ ৫ মেগাবাইট)
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <input
                            type="url"
                            placeholder="https://example.com/course-banner.jpg"
                            value={formData.thumbnailUrl}
                            onChange={(e) =>
                              setFormData({ ...formData, thumbnailUrl: e.target.value })
                            }
                            className="w-full rounded-xl border border-[#232d38] bg-[#131b24] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
                          />
                        </div>
                        <span className="mt-1 block text-[10px] text-slate-500">
                          যেকোনো অনলাইন ইমেজ লিংক এখানে পেস্ট করতে পারেন।
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-[#232d38] bg-[#0c1218] text-[#b7f34a] focus:ring-0"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-slate-300 cursor-pointer">
                  ভর্তি অবিলম্বে চালু রাখুন (Publicly Active)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#232d38] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#232d38] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#182029]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="rounded-xl bg-[#b7f34a] px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#b7f34a]/20 hover:bg-[#cbf968] disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'সেভ হচ্ছে...'
                    : editingCourse
                    ? 'আপডেট সম্পন্ন করুন'
                    : 'কোর্স তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Delete Confirmation Modal (Guarded)                          */}
      {/* ============================================================ */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#232d38] bg-[#131b24] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">কোর্স মুছে ফেলার নিশ্চিতকরণ</h3>
                <span className="text-xs text-slate-400">"{deletingCourse.title}"</span>
              </div>
            </div>

            {(deletingCourse._count?.enrollments || 0) > 0 ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <div>
                    <strong>মনোযোগ দিন: ডেটা সুরক্ষা নীতি</strong>
                    <p className="mt-1 leading-relaxed text-amber-200/80">
                      এই কোর্সটিতে ইতিমধ্যে{' '}
                      <strong>
                        {toBengaliNumber(deletingCourse._count?.enrollments || 0)} জন শিক্ষার্থী
                      </strong>{' '}
                      ভর্তি রয়েছে। শিক্ষার্থীর লেনদেন ও প্রোফাইল অক্ষুণ্ণ রাখতে এটি ডাটাবেজ থেকে মুছে ফেলা হবে না, বরং স্বয়ংক্রিয়ভাবে{' '}
                      <span className="font-bold underline">পজ (নিষ্ক্রিয়)</span> করা হবে যাতে নতুন কোনো শিক্ষার্থী ভর্তি হতে না পারে।
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                এই কোর্সটিতে কোনো শিক্ষার্থী ভর্তি নেই। এটি স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলা নিরাপদ। আপনি কি নিশ্চিত?
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingCourse(null)}
                className="rounded-xl border border-[#232d38] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#182029]"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
              >
                {(deletingCourse._count?.enrollments || 0) > 0 ? 'পজ করে নিষ্ক্রিয় করুন' : 'স্থায়ীভাবে মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Bulk Delete Modal                                            */}
      {/* ============================================================ */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#232d38] bg-[#131b24] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">বাল্ক ডিলিট নিশ্চিতকরণ</h3>
                <span className="text-xs text-slate-400">
                  নির্বাচিত {toBengaliNumber(selectedIds.length)} টি কোর্স
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              যে কোর্সগুলোতে সক্রিয় শিক্ষার্থী রয়েছে সেগুলো ডাটা সুরক্ষার স্বার্থে পজ (নিষ্ক্রিয়) করা হবে, এবং শূন্য এনরোলমেন্টের কোর্সগুলো স্থায়ীভাবে মুছে ফেলা হবে। আপনি কি এগিয়ে যেতে চান?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="rounded-xl border border-[#232d38] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#182029]"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
              >
                বাল্ক অ্যাকশন কার্যকর করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function AdminCoursesPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminCoursesContent />
    </ProtectedRoute>
  )
}

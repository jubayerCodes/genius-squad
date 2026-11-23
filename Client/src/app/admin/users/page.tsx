'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Crown,
  UserCheck,
  UserX,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Phone,
  Mail,
  MapPin,
  Building2,
} from 'lucide-react'
import { UserProfile, toBengaliNumber } from '../../../data/mockData'
import { apiClient } from '../../../lib/apiClient'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import AdminNav from '../../../components/AdminNav'

interface AdminUserRecord extends UserProfile {
  fatherName?: string
  facebookUrl?: string
  createdAt?: string
  _count?: {
    enrollments: number
  }
}

function AdminUsersContent() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ADMIN'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL')

  // Modals & Action states
  const [roleModalUser, setRoleModalUser] = useState<{ user: AdminUserRecord; targetRole: 'STUDENT' | 'ADMIN' } | null>(null)
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserRecord | null>(null)
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Auto-dismiss toast
  useEffect(() => {
    if (actionNotification) {
      const timer = setTimeout(() => setActionNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [actionNotification])

  // Fetch live users list from backend
  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const res = await apiClient.getAdminUsers()
      if (res.data?.users) {
        setUsers(res.data.users)
      }
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'ব্যবহারকারী তালিকা লোড করা যায়নি।',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'STUDENT' && u.role !== 'STUDENT') return false
    if (roleFilter === 'ADMIN' && u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN') return false
    if (statusFilter === 'ACTIVE' && u.isSuspended === true) return false
    if (statusFilter === 'SUSPENDED' && u.isSuspended !== true) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const nameMatch = u.name?.toLowerCase().includes(q)
      const emailMatch = u.email?.toLowerCase().includes(q)
      const phoneMatch = u.phone?.includes(q)
      const districtMatch = u.district?.toLowerCase().includes(q)
      const instMatch = u.institution?.toLowerCase().includes(q)
      return nameMatch || emailMatch || phoneMatch || districtMatch || instMatch
    }

    return true
  })

  // Handle Promote / Downgrade Role
  const handleConfirmRoleChange = async () => {
    if (!roleModalUser) return

    try {
      setIsProcessing(true)
      const { user: target, targetRole } = roleModalUser
      const res = await apiClient.updateUserRole(target.id, targetRole)
      setRoleModalUser(null)
      setActionNotification({
        type: 'success',
        text: res.message || 'ভূমিকা সফলভাবে পরিবর্তন করা হয়েছে।',
      })
      await loadUsers()
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'ভূমিকা পরিবর্তন ব্যর্থ হয়েছে।',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Account Suspension Toggle
  const handleToggleSuspension = async (target: AdminUserRecord) => {
    try {
      const nextSuspended = !target.isSuspended
      const res = await apiClient.updateUserStatus(target.id, nextSuspended)
      setActionNotification({
        type: 'success',
        text: res.message || 'অ্যাকাউন্ট স্ট্যাটাস আপডেট করা হয়েছে।',
      })
      await loadUsers()
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।',
      })
    }
  }

  // Handle Delete User
  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return

    try {
      setIsProcessing(true)
      const res = await apiClient.deleteUser(deleteModalUser.id)
      setDeleteModalUser(null)
      setActionNotification({
        type: res.data?.suspended ? 'info' : 'success',
        text: res.message || 'অ্যাকাউন্ট মুছে ফেলা হয়েছে।',
      })
      await loadUsers()
    } catch (err: any) {
      setActionNotification({
        type: 'error',
        text: err?.message || 'অ্যাকাউন্ট মোছা সম্ভব হয়নি।',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Metrics
  const totalCount = users.length
  const studentsCount = users.filter((u) => u.role === 'STUDENT').length
  const adminsCount = users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length
  const suspendedCount = users.filter((u) => u.isSuspended === true).length

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

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

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
            👥 ব্যবহারকারী ও রোল নিয়ন্ত্রণ
          </div>
          <h1 className="mt-2 font-display text-3xl font-black text-white">
            ইউজার ম্যানেজমেন্ট
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            শিক্ষার্থীদের রোল পরিবর্তন করুন, অ্যাডমিন নিয়োগ দিন এবং অ্যাকাউন্টের স্থিতি নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#232d38] bg-[#182029] px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-[#202b37] hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[.04] p-5">
          <span className="text-xs font-semibold text-blue-300">মোট নিবন্ধিত ব্যবহারকারী</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(totalCount)} জন
          </strong>
          <span className="mt-1 block text-[11px] text-blue-300/70">ডাটাবেজে সংরক্ষিত</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.04] p-5">
          <span className="text-xs font-semibold text-emerald-300">সাধারণ শিক্ষার্থী</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(studentsCount)} জন
          </strong>
          <span className="mt-1 block text-[11px] text-emerald-300/70">STUDENT রোল</span>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[.04] p-5">
          <span className="text-xs font-semibold text-purple-300">অ্যাডমিন</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(adminsCount)} জন
          </strong>
          <span className="mt-1 block text-[11px] text-purple-300/70">অ্যাডমিন দল</span>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[.04] p-5">
          <span className="text-xs font-semibold text-rose-300">স্থগিত শিক্ষার্থী</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(suspendedCount)} জন
          </strong>
          <span className="mt-1 block text-[11px] text-rose-300/70">অ্যাক্সেস সাময়িক বন্ধ</span>
        </div>
      </div>

      {/* Toolbar: Search & Clean Filters */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#232d38] bg-[#131b24] p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="নাম, ইমেইল, ফোন নম্বর বা জেলা দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#232d38] bg-[#0c1218] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#b7f34a] focus:outline-none"
          />
        </div>

        {/* Clean Role Filters - Only 3 standard filters: All, Students, Admins */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#0c1218] p-1">
          {(
            [
              { key: 'ALL', label: 'সব ব্যবহারকারী' },
              { key: 'STUDENT', label: 'শিক্ষার্থী' },
              { key: 'ADMIN', label: 'অ্যাডমিন' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setRoleFilter(item.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                roleFilter === item.key
                  ? 'bg-[#1e2a38] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#0c1218] p-1">
          {(
            [
              { key: 'ALL', label: 'সব স্ট্যাটাস' },
              { key: 'ACTIVE', label: '🟢 সক্রিয়' },
              { key: 'SUSPENDED', label: '⛔ স্থগিত' },
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

      {/* Users Data Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#232d38] bg-[#131b24]">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b7f34a]" />
            <p className="mt-3 text-sm text-slate-400">ব্যবহারকারী তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-3 font-display text-base font-bold text-white">কোন ব্যবহারকারী পাওয়া যায়নি</h3>
            <p className="mt-1 text-xs text-slate-400">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#232d38] bg-[#0e151d] text-slate-400">
                  <th className="py-3.5 pl-6 pr-4 font-semibold">ব্যবহারকারী</th>
                  <th className="py-3.5 px-4 font-semibold">যোগাযোগ ও জেলা</th>
                  <th className="py-3.5 px-4 font-semibold">ভূমিকা (Role)</th>
                  <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-semibold">কোর্স এনরোল</th>
                  <th className="py-3.5 px-6 text-right font-semibold">অ্যাকশন ও পারমিশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2833]">
                {filteredUsers.map((u) => {
                  const enrollmentsCount = u._count?.enrollments || 0
                  const isSuspended = u.isSuspended === true
                  const isTargetSuperAdmin = u.role === 'SUPER_ADMIN'
                  const isTargetAdmin = u.role === 'ADMIN'
                  const isTargetStudent = u.role === 'STUDENT'
                  const fatherNameDisplay = u.fatherName || u.father_name

                  return (
                    <tr key={u.id} className="transition-colors hover:bg-[#182330]">
                      {/* User Info - Clean vertical stack, no overlapping IDs */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`flex size-10 flex-shrink-0 items-center justify-center rounded-xl border font-bold text-sm shadow-inner ${
                            isTargetSuperAdmin
                              ? 'border-purple-500/40 bg-purple-500/15 text-purple-300'
                              : isTargetAdmin
                              ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                              : 'border-[#232d38] bg-[#0c1218] text-slate-300'
                          }`}>
                            {isTargetSuperAdmin ? '👑' : u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-display text-sm font-bold text-white truncate max-w-[200px]">
                              {u.name}
                            </span>
                            {fatherNameDisplay && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                পিতা: {fatherNameDisplay}
                              </span>
                            )}
                            {u.institution && (
                              <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                {u.institution}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact & District */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate max-w-[190px]">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate max-w-[190px]">
                              {u.district || 'জেলা নেই'}
                              {u.upazila ? `, ${u.upazila}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge - Single Super Admin Role clearly denoted */}
                      <td className="py-4 px-4">
                        {isTargetSuperAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-2.5 py-1 text-[11px] font-bold text-purple-300 shadow-sm shadow-purple-500/10">
                            <Crown className="h-3.5 w-3.5 text-purple-400" />
                            সুপার অ্যাডমিন (মালিক)
                          </span>
                        ) : isTargetAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 shadow-sm shadow-amber-400/10">
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                            অ্যাডমিন
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-300">
                            <Shield className="h-3.5 w-3.5 text-blue-400" />
                            শিক্ষার্থী
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isSuspended
                              ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                              : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isSuspended ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                          {isSuspended ? 'স্থগিত' : 'সক্রিয়'}
                        </span>
                      </td>

                      {/* Enrolled Courses Count */}
                      <td className="py-4 px-4 font-semibold text-white">
                        {isTargetSuperAdmin ? (
                          <span className="text-slate-500 text-[11px] font-medium">—</span>
                        ) : (
                          <span>{toBengaliNumber(enrollmentsCount)} টি কোর্স</span>
                        )}
                      </td>

                      {/* Actions & Permissions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* Super Admin: Unique single root owner - unmodifiable */}
                          {isTargetSuperAdmin && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/[.06] px-2.5 py-1 text-[11px] font-medium text-purple-300/80">
                              <Lock className="h-3 w-3 text-purple-400" />
                              মূল অ্যাডমিন (Root)
                            </span>
                          )}

                          {/* Student Actions */}
                          {isTargetStudent && (
                            <>
                              <button
                                onClick={() => setRoleModalUser({ user: u, targetRole: 'ADMIN' })}
                                title="অ্যাডমিন বানান"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
                              >
                                <ArrowUpCircle className="h-3.5 w-3.5" />
                                <span>অ্যাডমিন বানান</span>
                              </button>

                              <button
                                onClick={() => handleToggleSuspension(u)}
                                title={isSuspended ? 'অ্যাকাউন্ট চালু করুন' : 'অ্যাকাউন্ট স্থগিত করুন'}
                                className={`rounded-xl p-2 transition-colors ${
                                  isSuspended
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                }`}
                              >
                                {isSuspended ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                              </button>

                              <button
                                onClick={() => setDeleteModalUser(u)}
                                title="মুছে ফেলুন"
                                className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {/* Admin Actions */}
                          {isTargetAdmin && (
                            <>
                              {isSuperAdmin ? (
                                <>
                                  <button
                                    onClick={() => setRoleModalUser({ user: u, targetRole: 'STUDENT' })}
                                    title="শিক্ষার্থী হিসেবে ডাউনগ্রেড করুন"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300 transition-colors hover:bg-blue-500/20"
                                  >
                                    <ArrowDownCircle className="h-3.5 w-3.5" />
                                    <span>ডাউনগ্রেড</span>
                                  </button>

                                  <button
                                    onClick={() => handleToggleSuspension(u)}
                                    title={isSuspended ? 'অ্যাকাউন্ট চালু করুন' : 'স্থগিত করুন'}
                                    className={`rounded-xl p-2 transition-colors ${
                                      isSuspended
                                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                    }`}
                                  >
                                    {isSuspended ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                  </button>

                                  <button
                                    onClick={() => setDeleteModalUser(u)}
                                    title="অ্যাডমিন মুছে ফেলুন"
                                    className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                  <Lock className="h-3 w-3" />
                                  <span>সুপার অ্যাডমিন নিয়ন্ত্রিত</span>
                                </span>
                              )}
                            </>
                          )}
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
      {/* Role Change Confirmation Modal (Promote / Downgrade)         */}
      {/* ============================================================ */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#232d38] bg-[#131b24] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  roleModalUser.targetRole === 'ADMIN'
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}
              >
                {roleModalUser.targetRole === 'ADMIN' ? (
                  <ArrowUpCircle className="h-5 w-5" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  {roleModalUser.targetRole === 'ADMIN'
                    ? 'অ্যাডমিন পদোন্নতি নিশ্চিতকরণ'
                    : 'শিক্ষার্থী ডাউনগ্রেড নিশ্চিতকরণ'}
                </h3>
                <span className="text-xs text-slate-400">"{roleModalUser.user.name}"</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              {roleModalUser.targetRole === 'ADMIN' ? (
                <>
                  আপনি কি নিশ্চিত যে <strong className="text-white">"{roleModalUser.user.name}"</strong>-কে অ্যাডমিন হিসেবে পদোন্নতি দিতে চান? অ্যাডমিন হিসেবে তিনি কোর্স ও পেমেন্ট ভেরিফিকেশন পরিচালনা করতে পারবেন।
                  <span className="mt-2 block rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-200">
                    ⚠️ নীতি: একবার অ্যাডমিন করা হলে শুধুমাত্র সুপার অ্যাডমিন তাকে পুনরায় সাধারণ শিক্ষার্থী করতে পারবেন।
                  </span>
                </>
              ) : (
                <>
                  আপনি কি নিশ্চিত যে <strong className="text-white">"{roleModalUser.user.name}"</strong>-এর অ্যাডমিন অ্যাক্সেস প্রত্যাহার করে তাকে সাধারণ শিক্ষার্থী হিসেবে রূপান্তর করতে চান?
                </>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="rounded-xl border border-[#232d38] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#182029]"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmRoleChange}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg disabled:opacity-50 ${
                  roleModalUser.targetRole === 'ADMIN'
                    ? 'bg-amber-400 text-black hover:bg-amber-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing
                  ? 'প্রসেসিং...'
                  : roleModalUser.targetRole === 'ADMIN'
                  ? 'অ্যাডমিন করুন'
                  : 'ডাউনগ্রেড নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Delete User Modal                                            */}
      {/* ============================================================ */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#232d38] bg-[#131b24] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">ব্যবহারকারী মুছে ফেলার নিশ্চিতকরণ</h3>
                <span className="text-xs text-slate-400">"{deleteModalUser.name}"</span>
              </div>
            </div>

            {(deleteModalUser._count?.enrollments || 0) > 0 ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <p className="leading-relaxed">
                  এই শিক্ষার্থীর <strong>{toBengaliNumber(deleteModalUser._count?.enrollments || 0)} টি কোর্সে ভর্তি ও লেনদেন রেকর্ড</strong> রয়েছে। হিসাব ও প্রমাণ সংরক্ষণের স্বার্থে অ্যাকাউন্টটি ডাটাবেজ থেকে মুছে ফেলা হবে না, বরং স্বয়ংক্রিয়ভাবে <span className="font-bold underline">স্থগিত (Suspended)</span> করা হবে।
                </p>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                আপনি কি নিশ্চিত যে <strong>"{deleteModalUser.name}"</strong> অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান? এই অ্যাকশনটি ফিরিয়ে আনা যাবে না।
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="rounded-xl border border-[#232d38] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#182029]"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 disabled:opacity-50"
              >
                {isProcessing
                  ? 'প্রসেসিং...'
                  : (deleteModalUser._count?.enrollments || 0) > 0
                  ? 'স্থগিত করে নিষ্ক্রিয় করুন'
                  : 'স্থায়ীভাবে মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminUsersContent />
    </ProtectedRoute>
  )
}

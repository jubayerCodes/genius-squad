'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Enrollment, updateEnrollmentStatus, parseBengaliPrice, toBengaliNumber } from '../../data/mockData'
import { apiClient } from '../../lib/apiClient'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import AdminNav from '../../components/AdminNav'

function AdminContent() {
  const { enrollments: contextEnrollments, setEnrollments } = useAuth()
  const [filterTab, setFilterTab] = useState<'PENDING' | 'ALL'>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [rejectModal, setRejectModal] = useState<Enrollment | null>(null)
  const [rejectReason, setRejectReason] = useState('ভুল ট্রানজেকশন আইডি')
  const [liveEnrollments, setLiveEnrollments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch live enrollments from API
  const refreshAdminData = async () => {
    try {
      setIsLoading(true)
      const res = await apiClient.getAdminEnrollments()
      if (res.data?.enrollments) {
        setLiveEnrollments(res.data.enrollments)
        setEnrollments(res.data.enrollments)
      } else {
        setLiveEnrollments([])
      }
    } catch {
      setLiveEnrollments([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshAdminData()
  }, [])

  const currentList = liveEnrollments

  const handleApprove = async (id: string) => {
    // Optimistic update
    const updated = updateEnrollmentStatus(id, 'APPROVED')
    setEnrollments(updated)
    setLiveEnrollments(
      liveEnrollments.map((e) => (e.id === id ? { ...e, status: 'APPROVED' } : e))
    )

    // Call live API
    try {
      await apiClient.verifyEnrollment(id, { status: 'APPROVED' })
    } catch {
      // Local optimistic state preserved
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectModal) return
    const id = rejectModal.id

    // Optimistic update
    const updated = updateEnrollmentStatus(id, 'REJECTED', rejectReason)
    setEnrollments(updated)
    setLiveEnrollments(
      liveEnrollments.map((e) =>
        e.id === id ? { ...e, status: 'REJECTED', rejectionReason: rejectReason } : e
      )
    )

    setRejectModal(null)
    setRejectReason('ভুল ট্রানজেকশন আইডি')

    // Call live API
    try {
      await apiClient.verifyEnrollment(id, { status: 'REJECTED', rejectionReason: rejectReason })
    } catch {
      // Local optimistic state preserved
    }
  }

  const formatOrderDate = (date: any) => {
    if (!date) return ''
    if (typeof date === 'string' && (date.includes('নভেম্বর') || date.includes('AM') || date.includes('PM'))) {
      return date
    }
    const d = new Date(date)
    return isNaN(d.getTime()) ? String(date) : d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Filter list
  const filtered = currentList
    .filter((e) => (filterTab === 'PENDING' ? e.status === 'PENDING' : true))
    .filter((e) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        (e.transactionId && e.transactionId.toLowerCase().includes(q)) ||
        (e.senderNumber && e.senderNumber.includes(q)) ||
        (e.studentName && e.studentName.toLowerCase().includes(q))
      )
    })

  // Statistics
  const pendingCount = currentList.filter((e) => e.status === 'PENDING').length
  const approvedCount = currentList.filter((e) => e.status === 'APPROVED').length
  const rejectedCount = currentList.filter((e) => e.status === 'REJECTED').length

  const totalRevenue = currentList
    .filter((e) => e.status === 'APPROVED')
    .reduce((sum, item) => {
      if (typeof item.amount === 'number') return sum + item.amount
      return sum + parseBengaliPrice(item.amount)
    }, 0)

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
      <AdminNav />

      {/* Admin Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
            🛡️ অ্যাডমিন ড্যাশবোর্ড
          </div>
          <h1 className="mt-2 font-display text-3xl font-black text-white">
            ম্যানুয়াল পেমেন্ট ভেরিফিকেশন
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            বিকাশ ও নগদ একাউন্টে আসা পেমেন্ট চেক করে শিক্ষার্থীদের অবিলম্বে গ্রুপ অ্যাক্সেস দিন।
          </p>
        </div>

        <button
          onClick={refreshAdminData}
          disabled={isLoading}
          className="secondary-button !text-xs !py-2.5 disabled:opacity-50"
        >
          {isLoading ? 'রিফ্রেশ হচ্ছে...' : '🔄 ডাটা রিফ্রেশ করুন'}
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[.04] p-5">
          <span className="text-xs font-semibold text-amber-300">পেন্ডিং আবেদন</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(pendingCount)} টি
          </strong>
          <span className="text-[11px] text-amber-300/70 mt-1 block">অনুমোদনের অপেক্ষায়</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.04] p-5">
          <span className="text-xs font-semibold text-emerald-400">অনুমোদিত শিক্ষার্থী</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(approvedCount)} জন
          </strong>
          <span className="text-[11px] text-emerald-400/70 mt-1 block">গ্রুপ লিংক অ্যাক্টিভ</span>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[.04] p-5">
          <span className="text-xs font-semibold text-rose-400">বাতিলকৃত আবেদন</span>
          <strong className="mt-2 block font-display text-3xl font-black text-white">
            {toBengaliNumber(rejectedCount)} টি
          </strong>
          <span className="text-[11px] text-rose-400/70 mt-1 block">ভুল বা নকল TrxID</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
          <span className="text-xs font-semibold text-slate-300">মোট সংগৃহীত ফি</span>
          <strong className="mt-2 block font-display text-3xl font-black text-[#b7f34a]">
            ৳ {toBengaliNumber(totalRevenue)}
          </strong>
          <span className="text-[11px] text-slate-500 mt-1 block">ভেরিফায়েড রেভিনিউ</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Tabs */}
        <div className="flex rounded-xl border border-white/10 bg-[#0c1915] p-1 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`rounded-lg px-4 py-2 transition ${
              filterTab === 'PENDING'
                ? 'bg-amber-400 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            পেন্ডিং ভেরিফিকেশন ({pendingCount})
          </button>
          <button
            onClick={() => setFilterTab('ALL')}
            className={`rounded-lg px-4 py-2 transition ${
              filterTab === 'ALL'
                ? 'bg-white/10 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            সকল এনরোলমেন্ট ({currentList.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="TrxID, ফোন বা নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field !py-2 !text-xs !bg-[#0c1915]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#0c1915]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/[.02] text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-4 px-4">শিক্ষার্থীর তথ্য</th>
              <th className="py-4 px-4">প্রতিষ্ঠান ও জেলা</th>
              <th className="py-4 px-4">কোর্স ও ফি</th>
              <th className="py-4 px-4">পেমেন্ট ও TrxID</th>
              <th className="py-4 px-4">স্ট্যাটাস</th>
              <th className="py-4 px-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[.06]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  কোনো লেনদেন পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="transition hover:bg-white/[.015]">
                  {/* Student Details */}
                  <td className="py-4 px-4">
                    <strong className="block text-white text-sm">{item.studentName}</strong>
                    <span className="text-slate-400 block mt-0.5">{item.studentPhone}</span>
                    <a
                      href={item.facebookUrl || 'https://facebook.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#b7f34a] hover:underline"
                    >
                      ফেসবুক প্রোফাইল ↗
                    </a>
                  </td>

                  {/* Institution */}
                  <td className="py-4 px-4">
                    <span className="text-slate-300 block">{item.institution}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">{item.district}</span>
                  </td>

                  {/* Course & Amount */}
                  <td className="py-4 px-4">
                    <span className="text-white font-medium block">{item.courseTitle}</span>
                    <strong className="text-emerald-400 font-display text-sm block mt-0.5">
                      {typeof item.amount === 'number' ? `৳ ${item.amount.toLocaleString('bn-BD')}` : item.amount}
                    </strong>
                  </td>

                  {/* Payment Details */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        (item.paymentMethod || item.method) === 'bKash' || (item.paymentMethod || item.method) === 'BKASH'
                          ? 'bg-[#e2136e]/20 text-[#e2136e]'
                          : 'bg-[#f7941d]/20 text-[#f7941d]'
                      }`}>
                        {item.paymentMethod || item.method}
                      </span>
                      <span className="text-slate-400">প্রেরক: {item.senderNumber}</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-white font-bold tracking-wider">
                      TrxID: <span className="text-[#b7f34a]">{item.transactionId}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {formatOrderDate(item.createdAt)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    {item.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                        ✓ অনুমোদিত
                      </span>
                    )}
                    {item.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                        ⏳ পেন্ডিং
                      </span>
                    )}
                    {item.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-rose-400" title={item.rejectionReason}>
                        ✕ বাতিল
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    {item.status === 'PENDING' ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="rounded-lg bg-emerald-500 px-3 py-1.5 font-bold text-[#07110e] text-xs transition hover:bg-emerald-400"
                          title="টাকা পাওয়া নিশ্চিত হয়েছে"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => setRejectModal(item)}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-bold text-rose-400 text-xs transition hover:bg-rose-500/20"
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">সম্পন্ন</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1915] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">পেমেন্ট বাতিল করার কারণ</h3>
            <p className="mt-1 text-xs text-slate-400">
              শিক্ষার্থী {rejectModal.studentName}-এর TrxID: {rejectModal.transactionId} বাতিলের কারণ নির্বাচন করুন।
            </p>

            <div className="mt-4 space-y-3">
              {[
                'ভুল ট্রানজেকশন আইডি',
                'নির্ধারিত একাউন্টে টাকা জমা হয়নি',
                'অসম্পূর্ণ পেমেন্ট ফি',
                'ডুপ্লিকেট TrxID সাবমিশন',
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="accent-rose-500"
                  />
                  {reason}
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="secondary-button !text-xs !py-2"
              >
                ফিরে যান
              </button>
              <button
                onClick={handleRejectConfirm}
                className="rounded-lg bg-rose-500 px-4 py-2 font-bold text-white text-xs hover:bg-rose-600"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminContent />
    </ProtectedRoute>
  )
}

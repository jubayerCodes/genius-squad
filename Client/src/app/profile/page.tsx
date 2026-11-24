'use client'

import { useState, FormEvent, useEffect } from 'react'
import Link from 'next/link'
import { UserProfile, setStoredUser } from '../../data/mockData'
import DistrictSelect from '../../components/DistrictSelect'
import ProtectedRoute from '../../components/ProtectedRoute'
import { apiClient } from '../../lib/apiClient'
import { useAuth } from '../../context/AuthContext'

const facebookUrlRegex =
  /^(https?:\/\/)?((www|web|m)\.)?(facebook\.com|fb\.com)\/(profile\.php\?id=\d+|[a-zA-Z0-9.\-_]{3,})\/?.*$/i

function ProfileContent() {
  const { user, setUser } = useAuth()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    father_name: user?.father_name || '',
    district: user?.district || 'ঢাকা',
    upazila: user?.upazila || '',
    institution: user?.institution || '',
    email: user?.email || '',
    phone: user?.phone || '',
    facebook_url: user?.facebook_url || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        father_name: user.father_name || '',
        district: user.district || 'ঢাকা',
        upazila: user.upazila || '',
        institution: user.institution || '',
        email: user.email || '',
        phone: user.phone || '',
        facebook_url: user.facebook_url || '',
      })
    }
  }, [user])

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successToast, setSuccessToast] = useState(false)
  const [passwordToast, setPasswordToast] = useState(false)

  const handleInfoSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setErrorMessage('')

    if (formData.facebook_url && !facebookUrlRegex.test(formData.facebook_url.trim())) {
      setErrorMessage(
        'সঠিক ফেসবুক প্রোফাইল লিংক দিন (যেমন: https://facebook.com/yourprofile বা https://fb.com/yourprofile)'
      )
      return
    }

    setIsLoading(true)

    try {
      const res = await apiClient.updateProfile({
        name: formData.name,
        fatherName: formData.father_name,
        district: formData.district,
        upazila: formData.upazila,
        institution: formData.institution,
        phone: formData.phone,
        facebookUrl: formData.facebook_url,
      })

      const updated: UserProfile = {
        ...user,
        name: res.data?.user?.name || formData.name,
        father_name: res.data?.user?.fatherName || formData.father_name,
        district: res.data?.user?.district || formData.district,
        upazila: res.data?.user?.upazila || formData.upazila,
        institution: res.data?.user?.institution || formData.institution,
        phone: res.data?.user?.phone || formData.phone,
        facebook_url: res.data?.user?.facebookUrl || formData.facebook_url,
      }

      setUser(updated)
      setStoredUser(updated)
      setSuccessToast(true)
      setTimeout(() => setSuccessToast(false), 3000)
    } catch (err: any) {
      setErrorMessage(err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      await apiClient.updateProfile({
        password: passwordData.newPassword,
      })

      setPasswordToast(true)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordToast(false), 3000)
    } catch (err: any) {
      setErrorMessage(err.message || 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-[840px] px-5 py-12 lg:px-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={user?.role === 'STUDENT' ? '/dashboard' : '/admin'}
            className="text-xs text-slate-400 hover:text-white mb-2 inline-block transition"
          >
            ← {user?.role === 'STUDENT' ? 'ড্যাশবোর্ডে' : 'অ্যাডমিন প্যানেলে'} ফিরে যান
          </Link>
          <h1 className="font-display text-3xl font-black text-white">প্রোফাইল সেটিংস</h1>
          <p className="text-xs text-slate-400 mt-1">আপনার ব্যক্তিগত ও একাডেমিক তথ্য আপডেট করুন।</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
          ⚠️ {errorMessage}
        </div>
      )}

      {successToast && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <span>✓</span> প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!
        </div>
      )}

      {passwordToast && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <span>✓</span> পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!
        </div>
      )}

      <div className="space-y-8">
        {/* Personal & Academic Information Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1915] p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-white border-b border-white/[.08] pb-4 mb-6">
            ব্যক্তিগত ও শিক্ষা প্রতিষ্ঠানের তথ্য
          </h2>

          <form onSubmit={handleInfoSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label">শিক্ষার্থীর পুরো নাম</label>
                <input
                  required
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <label className="field-label">পিতার নাম</label>
                <input
                  required
                  type="text"
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <DistrictSelect
                  label="জেলা"
                  required
                  value={formData.district}
                  onChange={(val) => setFormData({ ...formData, district: val })}
                />
              </div>

              <div>
                <label className="field-label">উপজেলা</label>
                <input
                  required
                  type="text"
                  value={formData.upazila}
                  onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                  className="field"
                  placeholder="যেমন: মিরপুর, সদর"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="field-label">স্কুল বা কলেজ</label>
                <input
                  required
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="field"
                  placeholder="আপনার শিক্ষা প্রতিষ্ঠানের পুরো নাম"
                />
              </div>

              <div>
                <label className="field-label">ইমেইল ঠিকানা</label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  disabled
                  className="field !bg-white/[.01] !text-slate-500 cursor-not-allowed"
                  title="ইমেইল পরিবর্তনযোগ্য নয়"
                />
              </div>

              <div>
                <label className="field-label">ফোন নম্বর</label>
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="field"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="field-label">ফেসবুক আইডি প্রোফাইল লিংক</label>
                <input
                  required
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="field"
                  placeholder="https://facebook.com/yourprofile"
                />
                <small className="mt-1 block text-[11px] text-slate-500">
                  * সিক্রেট ফেসবুক গ্রুপে রিকোয়েস্ট যাচাইয়ের জন্য এই লিংকটি ব্যবহৃত হয়।
                </small>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button !px-6 !py-2.5 disabled:opacity-50"
              >
                {isLoading ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সেভ করুন'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1915] p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-white border-b border-white/[.08] pb-4 mb-6">
            পাসওয়ার্ড পরিবর্তন
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
            <div>
              <label className="field-label">বর্তমান পাসওয়ার্ড</label>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="field"
                placeholder="বর্তমান পাসওয়ার্ড দিন"
              />
            </div>

            <div>
              <label className="field-label">নতুন পাসওয়ার্ড</label>
              <input
                required
                type="password"
                minLength={6}
                autoComplete="new-password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="field"
                placeholder="কমপক্ষে ৬ অক্ষর"
              />
            </div>

            <div>
              <label className="field-label">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
              <input
                required
                type="password"
                minLength={6}
                autoComplete="new-password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="field"
                placeholder="নতুন পাসওয়ার্ড পুনরায় লিখুন"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="secondary-button !px-5 !py-2.5 disabled:opacity-50"
              >
                {isLoading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
      <ProfileContent />
    </ProtectedRoute>
  )
}

'use client'

import { FormEvent, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserProfile, setStoredUser } from '../data/mockData'
import DistrictSelect from './DistrictSelect'
import { apiClient } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthProps {
  mode: 'login' | 'register'
}

const facebookUrlRegex =
  /^(https?:\/\/)?((www|web|m)\.)?(facebook\.com|fb\.com)\/(profile\.php\?id=\d+|[a-zA-Z0-9.\-_]{3,})\/?.*$/i

export function Auth({ mode }: AuthProps) {
  const isLogin = mode === 'login'
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  const { user, setUser, isLoading: authLoading } = useAuth()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [registerData, setRegisterData] = useState({
    name: '',
    father_name: '',
    district: '',
    upazila: '',
    institution: '',
    email: '',
    phone: '',
    facebook_url: '',
    password: '',
  })

  // If already logged in, redirect away from login/register
  useEffect(() => {
    if (!authLoading && user) {
      if (redirectParam) {
        router.replace(redirectParam)
      } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.replace('/admin')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [user, authLoading, router, redirectParam])

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await apiClient.login({
        email: loginEmail,
        password: loginPassword,
      })

      const userProfile: UserProfile = {
        id: res.data.user.id,
        name: res.data.user.name,
        father_name: res.data.user.fatherName || res.data.user.father_name || '',
        district: res.data.user.district,
        upazila: res.data.user.upazila,
        institution: res.data.user.institution,
        email: res.data.user.email,
        phone: res.data.user.phone,
        facebook_url: res.data.user.facebookUrl || res.data.user.facebook_url || '',
        role: res.data.user.role,
      }

      setUser(userProfile)
      setStoredUser(userProfile)

      if (redirectParam) {
        router.replace(redirectParam)
      } else if (userProfile.role === 'ADMIN' || userProfile.role === 'SUPER_ADMIN') {
        router.replace('/admin')
      } else {
        router.replace('/dashboard')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক তথ্য দিন।')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!registerData.district) {
      setErrorMessage('অনুগ্রহ করে জেলা নির্বাচন করুন।')
      return
    }

    if (!facebookUrlRegex.test(registerData.facebook_url.trim())) {
      setErrorMessage(
        'সঠিক ফেসবুক প্রোফাইল লিংক দিন (যেমন: https://facebook.com/yourprofile বা https://fb.com/yourprofile)'
      )
      return
    }

    setIsLoading(true)

    try {
      const res = await apiClient.register({
        name: registerData.name,
        fatherName: registerData.father_name,
        district: registerData.district,
        upazila: registerData.upazila,
        institution: registerData.institution,
        email: registerData.email,
        phone: registerData.phone,
        facebookUrl: registerData.facebook_url,
        password: registerData.password,
      })

      const userProfile: UserProfile = {
        id: res.data.user.id,
        name: res.data.user.name,
        father_name: res.data.user.fatherName || res.data.user.father_name || '',
        district: res.data.user.district,
        upazila: res.data.user.upazila,
        institution: res.data.user.institution,
        email: res.data.user.email,
        phone: res.data.user.phone,
        facebook_url: res.data.user.facebookUrl || res.data.user.facebook_url || '',
        role: res.data.user.role,
      }

      setUser(userProfile)
      setStoredUser(userProfile)

      if (redirectParam) {
        router.replace(redirectParam)
      } else {
        router.replace('/dashboard')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'নিবন্ধন সম্পন্ন করা যায়নি। অনুগ্রহ করে সঠিক তথ্য দিন।')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-[700px] px-5 py-12 lg:px-8">
      {/* Intro */}
      <div className="mb-8 text-center">
        <p className="section-kicker">
          {isLogin ? 'ফিরে আসায় স্বাগতম' : 'তোমার যাত্রা শুরু হোক'}
        </p>
        <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
          {isLogin ? 'স্টুডেন্ট লগইন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          {isLogin
            ? 'আপনার ইমেইল ও পাসওয়ার্ড দিয়ে অ্যাকাউন্টে প্রবেশ করুন।'
            : 'সঠিক তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন।'}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#0c1915] p-6 sm:p-8">
        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="field-label">ইমেইল ঠিকানা</label>
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className="field"
              />
            </div>

            <div>
              <label className="field-label">পাসওয়ার্ড</label>
              <input
                required
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড দিন"
                className="field"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#b7f34a]" />
                মনে রাখুন
              </label>
              <button
                type="button"
                onClick={() =>
                  alert('পাসওয়ার্ড রিসেট করতে অ্যাডমিন হটলাইনে (০১৭০০-০০০০০০) যোগাযোগ করুন।')
                }
                className="text-[#b7f34a] hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="primary-button mt-4 w-full justify-center !py-3 disabled:opacity-50"
            >
              {isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন →'}
            </button>

            <p className="mt-6 text-center text-xs text-slate-400">
              অ্যাকাউন্ট নেই?{' '}
              <Link
                href="/register"
                className="font-bold text-[#b7f34a] hover:underline"
              >
                নতুন অ্যাকাউন্ট তৈরি করুন
              </Link>
            </p>
          </form>
        ) : (
          /* Registration Form with 8 demographic fields */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">শিক্ষার্থীর পুরো নাম *</label>
                <input
                  required
                  type="text"
                  placeholder="আপনার পুরো নাম"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <label className="field-label">পিতার নাম *</label>
                <input
                  required
                  type="text"
                  placeholder="পিতার পুরো নাম"
                  value={registerData.father_name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, father_name: e.target.value })
                  }
                  className="field"
                />
              </div>

              <div className="sm:col-span-1">
                <DistrictSelect
                  label="জেলা"
                  required
                  value={registerData.district}
                  onChange={(val) => setRegisterData({ ...registerData, district: val })}
                />
              </div>

              <div>
                <label className="field-label">উপজেলা/থানা *</label>
                <input
                  required
                  type="text"
                  placeholder="যেমন: মিরপুর, সদর"
                  value={registerData.upazila}
                  onChange={(e) => setRegisterData({ ...registerData, upazila: e.target.value })}
                  className="field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="field-label">স্কুল বা কলেজ *</label>
                <input
                  required
                  type="text"
                  placeholder="আপনার শিক্ষা প্রতিষ্ঠানের পুরো নাম"
                  value={registerData.institution}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, institution: e.target.value })
                  }
                  className="field"
                />
              </div>

              <div>
                <label className="field-label">ইমেইল ঠিকানা *</label>
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <label className="field-label">মোবাইল নম্বর *</label>
                <input
                  required
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className="field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="field-label">ফেসবুক প্রোফাইল লিংক *</label>
                <input
                  required
                  type="url"
                  placeholder="https://facebook.com/yourprofile"
                  value={registerData.facebook_url}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, facebook_url: e.target.value })
                  }
                  className="field"
                />
                <small className="mt-1 block text-[11px] text-slate-500">
                  যেমন: https://facebook.com/yourname অথবা https://fb.com/yourname
                </small>
              </div>

              <div className="sm:col-span-2">
                <label className="field-label">পাসওয়ার্ড *</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                  className="field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="primary-button mt-4 w-full justify-center !py-3 disabled:opacity-50"
            >
              {isLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন →'}
            </button>

            <p className="mt-6 text-center text-xs text-slate-400">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <Link
                href="/login"
                className="font-bold text-[#b7f34a] hover:underline"
              >
                লগইন করুন
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
export default Auth

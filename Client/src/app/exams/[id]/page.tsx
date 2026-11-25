'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { apiClient } from '../../../lib/apiClient'
import { useAuth } from '../../../context/AuthContext'

export default function ExamRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace('/exams')
      return
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      router.replace(`/admin/exams/${id}`)
      return
    }

    const resolveDestination = async () => {
      try {
        const res = await apiClient.getExams()
        const match = res.data?.exams?.find((e: any) => e.id === id)
        if (match?.mySubmission?.status === 'SUBMITTED') {
          router.replace(`/exams/${id}/result`)
        } else if (match?.isEligible) {
          router.replace(`/exams/${id}/take`)
        } else {
          router.replace('/exams')
        }
      } catch {
        router.replace('/exams')
      }
    }

    resolveDestination()
  }, [id, user, isLoading, router])

  return (
    <main className="mx-auto max-w-[800px] px-5 py-24 text-center">
      <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#b7f34a]" />
      <p className="mt-3 text-xs text-slate-400">পরীক্ষার পেজে নেওয়া হচ্ছে...</p>
    </main>
  )
}

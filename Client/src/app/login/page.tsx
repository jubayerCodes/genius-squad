'use client'

import { Suspense } from 'react'
import { Auth } from '../../components/Auth'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <Auth mode="login" />
    </Suspense>
  )
}

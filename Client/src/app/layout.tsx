import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const metadata: Metadata = {
  title: 'Genius Squad - প্রস্তুতি হোক জিনিয়াসদের মতো',
  description: 'বাংলাদেশের মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষার্থীদের জন্য মানসম্মত ও সহজলভ্য ডিজিটাল শিক্ষা প্ল্যাটফর্ম।',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#07110e] text-slate-300 font-sans selection:bg-[#b7f34a] selection:text-[#07110e] flex flex-col justify-between">
        <AuthProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

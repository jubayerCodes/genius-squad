'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard, BookOpen, Users } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'পেমেন্ট ভেরিফিকেশন',
      href: '/admin',
      icon: CreditCard,
      active: pathname === '/admin',
    },
    {
      label: 'কোর্স ম্যানেজমেন্ট',
      href: '/admin/courses',
      icon: BookOpen,
      active: pathname.startsWith('/admin/courses'),
    },
    {
      label: 'ইউজার ম্যানেজমেন্ট',
      href: '/admin/users',
      icon: Users,
      active: pathname.startsWith('/admin/users'),
    },
  ]

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-[#232d38] pb-4">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              item.active
                ? 'bg-[#b7f34a] text-black shadow-lg shadow-[#b7f34a]/10'
                : 'bg-[#182029] text-[#93a2b4] hover:bg-[#202b37] hover:text-white'
            }`}
          >
            <Icon className={`h-4 w-4 ${item.active ? 'text-black' : 'text-[#93a2b4]'}`} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { HeaderAuthSkeleton, Skeleton } from './Skeleton'
import { User, LogOut, LayoutDashboard, Settings, ShieldCheck } from 'lucide-react'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<'home' | 'courses' | 'about' | 'footer'>('home')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false)
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userDropdownOpen])

  // Track active section on scroll when on home page
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('' as any)
      return
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120
      const isBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100

      if (isBottom) {
        setActiveSection('footer')
        return
      }

      const sections = ['home', 'courses', 'about', 'footer']
      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i]
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          if (scrollPosition >= top) {
            setActiveSection(id as any)
            return
          }
        }
      }
      setActiveSection('home')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // Scroll to hash target on initial load if navigated with anchor
  useEffect(() => {
    if (pathname === '/' && typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash)
          if (el) {
            const headerOffset = 76
            const elementPosition = el.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
            setActiveSection(hash as any)
          }
        }, 150)
      }
    }
  }, [pathname])

  const handleLogout = () => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
    logout()
    router.push('/')
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    setMobileMenuOpen(false)
    if (pathname === '/') {
      e.preventDefault()
      setActiveSection('home')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      history.pushState(null, '', '/')
    } else {
      router.push('/')
    }
  }

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    setActiveSection(sectionId as any)

    if (pathname !== '/') {
      router.push(`/#${sectionId}`)
      return
    }

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      history.pushState(null, '', '/')
      return
    }

    const el = document.getElementById(sectionId)
    if (el) {
      const headerOffset = 76
      const elementPosition = el.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      history.pushState(null, '', `/#${sectionId}`)
    }
  }

  const getNavLinkClass = (section: string) => {
    const isActive = pathname === '/' && activeSection === section
    return `rounded-lg px-3.5 py-2 text-sm font-medium transition cursor-pointer ${
      isActive
        ? 'text-[#b7f34a] bg-white/[.04] font-semibold'
        : 'text-slate-400 hover:text-white hover:bg-white/[.02]'
    }`
  }

  const getMobileNavLinkClass = (section: string) => {
    const isActive = pathname === '/' && activeSection === section
    return `rounded-lg px-4 py-2.5 text-left text-sm font-medium transition cursor-pointer ${
      isActive
        ? 'text-[#b7f34a] bg-white/[.06] font-semibold'
        : 'text-slate-300 hover:bg-white/5'
    }`
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#07110e]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        {/* Brand Logo - Clicking takes user to home page and scrolls to header top */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-3 text-left group cursor-pointer"
          aria-label="Genius Squad Home"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#b7f34a] font-display text-sm font-black text-[#08130f] shadow-[0_0_28px_rgba(183,243,74,.25)] transition group-hover:scale-105">
            GS
          </span>
          <span>
            <strong className="block font-display text-[15px] leading-4 text-white tracking-wide">
              GENIUS SQUAD
            </strong>
            <small className="text-[10px] tracking-[.25em] text-slate-400">
              LEARN • LEAD • WIN
            </small>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="/#home"
            onClick={(e) => scrollToSection(e, 'home')}
            className={getNavLinkClass('home')}
          >
            হোম
          </a>
          <a
            href="/#courses"
            onClick={(e) => scrollToSection(e, 'courses')}
            className={getNavLinkClass('courses')}
          >
            কোর্সসমূহ
          </a>
          <a
            href="/#about"
            onClick={(e) => scrollToSection(e, 'about')}
            className={getNavLinkClass('about')}
          >
            আমাদের সম্পর্কে
          </a>
          <a
            href="/#footer"
            onClick={(e) => scrollToSection(e, 'footer')}
            className={getNavLinkClass('footer')}
          >
            যোগাযোগ
          </a>

          {/* Quick Shortcuts when logged in */}
          {isLoading ? (
            <Skeleton className="h-8 w-24 !bg-white/[.04] !rounded-lg" />
          ) : user?.role === 'STUDENT' ? (
            <Link
              href="/dashboard"
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                pathname === '/dashboard' ? 'text-[#b7f34a] bg-white/[.04]' : 'text-slate-300 hover:text-white'
              }`}
            >
              আমার ড্যাশবোর্ড
            </Link>
          ) : user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? (
            <Link
              href="/admin"
              className={`rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                pathname.startsWith('/admin')
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-white/5 text-amber-400 hover:bg-amber-400/10'
              }`}
            >
              🛡️ অ্যাডমিন প্যানেল
            </Link>
          ) : null}
        </nav>

        {/* Right CTA / User State */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <HeaderAuthSkeleton />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Circular Dummy Avatar Button */}
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`group flex size-10 items-center justify-center rounded-full transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:outline-none ${
                  userDropdownOpen
                    ? 'bg-[#b7f34a]/15'
                    : 'bg-white/[.05] hover:bg-white/[.10]'
                }`}
                title="অ্যাকাউন্ট মেনু"
                aria-label="User Account Menu"
              >
                <User
                  className={`size-5 transition-colors ${
                    userDropdownOpen
                      ? 'text-[#b7f34a]'
                      : 'text-slate-300 group-hover:text-white'
                  }`}
                />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-slate-700/80 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Summary Header */}
                  <div className="mb-2.5 border-b border-slate-800/80 px-2 pb-2.5">
                    <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                        {user.email || user.phone}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : user.role === 'ADMIN'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-primary/15 text-primary border border-primary/30'
                        }`}
                      >
                        {user.role === 'SUPER_ADMIN'
                          ? 'সুপার অ্যাডমিন'
                          : user.role === 'ADMIN'
                          ? 'অ্যাডমিন'
                          : 'শিক্ষার্থী'}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    {user.role === 'STUDENT' ? (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                      >
                        <LayoutDashboard className="size-4 text-primary" />
                        আমার ড্যাশবোর্ড
                      </Link>
                    ) : (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-amber-300 hover:bg-amber-400/10 transition"
                      >
                        <ShieldCheck className="size-4 text-amber-400" />
                        অ্যাডমিন প্যানেল
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                    >
                      <Settings className="size-4 text-slate-400" />
                      প্রোফাইল সেটিংস
                    </Link>
                  </div>

                  <div className="my-2 border-t border-slate-800/80" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <LogOut className="size-4 text-rose-400" />
                    লগআউট
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
              >
                লগইন
              </Link>
              <Link href="/register" className="primary-button !px-5 !py-2.5 text-xs">
                রেজিস্ট্রেশন
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-white/10 p-2 text-white md:hidden"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#07110e] p-5 md:hidden">
          <nav className="flex flex-col gap-2">
            <a
              href="/#home"
              onClick={(e) => scrollToSection(e, 'home')}
              className={getMobileNavLinkClass('home')}
            >
              হোম
            </a>
            <a
              href="/#courses"
              onClick={(e) => scrollToSection(e, 'courses')}
              className={getMobileNavLinkClass('courses')}
            >
              কোর্সসমূহ
            </a>
            <a
              href="/#about"
              onClick={(e) => scrollToSection(e, 'about')}
              className={getMobileNavLinkClass('about')}
            >
              আমাদের সম্পর্কে
            </a>
            <a
              href="/#footer"
              onClick={(e) => scrollToSection(e, 'footer')}
              className={getMobileNavLinkClass('footer')}
            >
              যোগাযোগ
            </a>

            {user?.role === 'STUDENT' ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                    pathname === '/dashboard' ? 'text-[#b7f34a] bg-white/[.06]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  আমার ড্যাশবোর্ড
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                    pathname === '/profile' ? 'text-[#b7f34a] bg-white/[.06]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  প্রোফাইল সেটিংস
                </Link>
              </>
            ) : user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                    pathname.startsWith('/admin') ? 'bg-amber-400/20 text-amber-300' : 'text-amber-400 hover:bg-amber-400/10'
                  }`}
                >
                  🛡️ অ্যাডমিন প্যানেল
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                    pathname === '/profile' ? 'text-[#b7f34a] bg-white/[.06]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  প্রোফাইল সেটিংস
                </Link>
              </>
            ) : null}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full !bg-white/[.05] !rounded-xl" />
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                  <span className="font-semibold text-white">{user.name}</span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-primary">
                    {user.role === 'SUPER_ADMIN'
                      ? 'সুপার অ্যাডমিন'
                      : user.role === 'ADMIN'
                      ? 'অ্যাডমিন'
                      : 'শিক্ষার্থী'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-rose-500/10 py-2.5 text-center text-xs font-bold text-rose-400"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 secondary-button justify-center"
                >
                  লগইন
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 primary-button justify-center"
                >
                  রেজিস্ট্রেশন
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

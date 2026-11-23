'use client'

import Link from 'next/link'

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  if (name === 'phone') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
      </svg>
    )
  }
  return null
}

export function Footer() {
  const scrollTo = (id: string) => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = `/#${id}`
      }
    }
  }

  return (
    <footer id="footer" className="mt-20 border-t border-white/[.07] bg-[#050d0a]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-3 text-left">
            <span className="grid size-9 place-items-center rounded-xl bg-[#b7f34a] font-display text-sm font-black text-[#08130f]">
              GS
            </span>
            <strong className="font-display text-[15px] leading-4 text-white tracking-wide">
              GENIUS SQUAD
            </strong>
          </Link>
          <p className="mt-4 max-w-sm text-xs leading-6 text-slate-400">
            বাংলাদেশের মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষার্থীদের জন্য মানসম্মত ও সহজলভ্য ডিজিটাল শিক্ষা। শিখো, এগিয়ে যাও, জয় করো।
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-wider text-white">দ্রুত লিংক</h4>
          <button onClick={() => scrollTo('courses')} className="mb-2.5 block text-xs text-slate-400 hover:text-white transition">
            কোর্সসমূহ
          </button>
          <button onClick={() => scrollTo('about')} className="mb-2.5 block text-xs text-slate-400 hover:text-white transition">
            আমাদের সম্পর্কে
          </button>
          <button onClick={() => alert('প্রাইভেসি পলিসি পেজ শীঘ্রই আসছে।')} className="mb-2.5 block text-xs text-slate-400 hover:text-white transition">
            প্রাইভেসি পলিসি
          </button>
          <button onClick={() => alert('শর্তাবলী পেজ শীঘ্রই আসছে।')} className="mb-2.5 block text-xs text-slate-400 hover:text-white transition">
            শর্তাবলী
          </button>
        </div>

        <div>
          <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-wider text-white">সহায়তা ও যোগাযোগ</h4>
          <p className="mb-2.5 flex items-center gap-2 text-xs text-slate-300">
            <Icon name="phone" size={15} /> ০১৭০০-০০০০০০
          </p>
          <p className="text-xs text-slate-400">support@geniussquad.com</p>
          <p className="mt-3 text-[11px] text-slate-500">ধানমন্ডি, ঢাকা - ১২০৯, বাংলাদেশ</p>
        </div>
      </div>

      <div className="border-t border-white/[.05] py-5 text-center text-xs text-slate-500">
        © ২০২৬ Genius Squad. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  )
}
export default Footer

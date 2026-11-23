'use client'

import React from 'react'
import Link from 'next/link'
import { Course } from '../data/mockData'
import { Icon } from './Icon'

export function CourseCard({ course }: { course: Course }) {
  const fallbackImage = '/assets/course-study.jpg'
  const imageSource = course.thumbnailUrl || fallbackImage
  const accentColor = course.accent || '#b7f34a'
  const featuresList = (course.features && course.features.length > 0)
    ? course.features
    : ((course as any).services || [])

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[.08] bg-[#0c1915] transition duration-300 hover:-translate-y-1 hover:border-white/20 flex flex-col justify-between">
      <div>
        <Link
          href={`/courses/${course.id}`}
          className="relative block h-48 w-full overflow-hidden text-left"
        >
          <img
            src={imageSource}
            alt={course.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.onerror = null
              target.src = fallbackImage
            }}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07110e] via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-[#07110e]/85 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            {course.level}
          </span>
          <span
            className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full text-[#07110e] shadow-lg"
            style={{ background: accentColor }}
          >
            <Icon name="play" size={18} />
          </span>
        </Link>

        <div className="p-5">
          <p className="mb-2 text-xs font-medium text-slate-500">{course.subtitle}</p>
          <Link
            href={`/courses/${course.id}`}
            className="text-left font-display text-xl font-bold text-white hover:text-[#b7f34a] transition block"
          >
            {course.title}
          </Link>

          <div className="mt-4 flex flex-wrap gap-2">
            {(course.subjects || []).map((s) => (
              <span key={s} className="rounded-md bg-white/[.05] px-2.5 py-1 text-[11px] text-slate-300">
                {s}
              </span>
            ))}
          </div>

          <div className="my-5 grid grid-cols-2 gap-2 border-y border-white/[.07] py-4">
            {featuresList.slice(0, 4).map((f: string) => (
              <span key={f} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="text-[#b7f34a]">
                  <Icon name="check" size={14} />
                </span>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-white/[.04]">
        <div>
          <strong className="text-xl text-white font-display">{course.price}</strong>
          <del className="ml-2 text-xs text-slate-500">{course.oldPrice}</del>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/courses/${course.id}`}
            className="secondary-button !px-3 !py-2 !text-xs"
          >
            বিস্তারিত
          </Link>
          <Link
            href={`/courses/${course.id}/enroll`}
            className="primary-button !px-4 !py-2 !text-xs"
          >
            এনরোল করুন
          </Link>
        </div>
      </div>
    </article>
  )
}
export default CourseCard

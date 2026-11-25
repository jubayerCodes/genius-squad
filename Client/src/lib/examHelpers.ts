import { toBengaliNumber } from '../data/mockData'

export const BENGALI_OPTION_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'] as const

export function getOptionLabel(index: number): string {
  return BENGALI_OPTION_LABELS[index] || String(index + 1)
}

export function formatBengaliDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  if (mins === 0) {
    return `${toBengaliNumber(secs)} সেকেন্ড`
  }
  if (secs === 0) {
    return `${toBengaliNumber(mins)} মিনিট`
  }
  return `${toBengaliNumber(mins)} মি. ${toBengaliNumber(secs)} সে.`
}

export function formatTimerDisplay(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (hours > 0) {
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`
  }
  return `${pad(mins)}:${pad(secs)}`
}

export function formatBengaliNumberDecimal(num: number): string {
  const fixed = Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, '')
  const map: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  }
  return fixed
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
}

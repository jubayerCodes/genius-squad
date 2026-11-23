'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { BD_DISTRICTS_DATA, DistrictItem } from '../data/districts'
import { Search, ChevronDown, Check, X } from 'lucide-react'

interface DistrictSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

export default function DistrictSelect({
  value,
  onChange,
  label,
  placeholder = 'জেলা নির্বাচন করুন',
  error,
  required = false,
  className = '',
  disabled = false,
}: DistrictSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Find currently selected district item (matches either key in English or bn in Bangla)
  const selectedDistrict = useMemo(() => {
    if (!value) return null
    return (
      BD_DISTRICTS_DATA.find(
        (d) =>
          d.bn === value ||
          d.key.toLowerCase() === value.toLowerCase()
      ) || null
    )
  }, [value])

  // Filter districts based on English search key (or Bangla name)
  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return BD_DISTRICTS_DATA
    const q = searchQuery.toLowerCase().trim()
    return BD_DISTRICTS_DATA.filter(
      (d) =>
        d.key.toLowerCase().includes(q) ||
        d.bn.includes(q)
    )
  }, [searchQuery])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else {
      setSearchQuery('')
    }
  }, [isOpen])

  const handleSelect = (item: DistrictItem) => {
    onChange(item.bn)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-900/80 border rounded-xl px-4 py-3 text-left transition-all ${
          error
            ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
            : isOpen
            ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary'
            : 'border-slate-800 hover:border-slate-700 text-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={selectedDistrict ? 'text-white font-medium' : 'text-slate-500'}>
          {selectedDistrict ? (
            <span className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400">{selectedDistrict.bn}</span>
              <span className="text-xs text-slate-400">({selectedDistrict.key})</span>
            </span>
          ) : (
            placeholder
          )}
        </span>

        <div className="flex items-center gap-1.5 text-slate-400">
          {selectedDistrict && !disabled && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleClear(e as unknown as React.MouseEvent)
                }
              }}
              className="p-1 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-md">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search district in English (e.g. Dhaka, Cumilla)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* List of districts */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/40 p-1">
            {filteredDistricts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                কোন জেলা পাওয়া যায়নি (&quot;{searchQuery}&quot;)
              </div>
            ) : (
              filteredDistricts.map((item) => {
                const isSelected = selectedDistrict?.key === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">{item.bn}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.key}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  )
}

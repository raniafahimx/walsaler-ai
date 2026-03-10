'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  subValue?: string
  icon: LucideIcon
  accentColor?: 'crimson' | 'amber' | 'burnt'
  trend?: { value: string; positive: boolean }
  delay?: number
  className?: string
}

const accentMap = {
  crimson: {
    bg:     'bg-crimson-500/10',
    border: 'border-crimson-500/25',
    text:   'text-crimson-500',
    icon:   'text-crimson-500',
    glow:   'shadow-glow-crimson',
    blob:   'bg-crimson-500/15',
  },
  amber: {
    bg:     'bg-[#d8973c]/10',
    border: 'border-[#d8973c]/25',
    text:   'text-[#d8973c]',
    icon:   'text-[#d8973c]',
    glow:   'shadow-glow-amber',
    blob:   'bg-[#d8973c]/15',
  },
  burnt: {
    bg:     'bg-[#bd632f]/10',
    border: 'border-[#bd632f]/25',
    text:   'text-[#bd632f]',
    icon:   'text-[#bd632f]',
    glow:   'shadow-[0_0_30px_-5px_rgba(189,99,47,0.2)]',
    blob:   'bg-[#bd632f]/15',
  },
}

export default function MetricCard({
  label, value, subValue, icon: Icon,
  accentColor = 'crimson', trend, delay = 0, className,
}: MetricCardProps) {
  const accent = accentMap[accentColor]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'glass rounded-2xl p-5 relative overflow-hidden glass-hover cursor-default',
        accent.glow,
        className
      )}
    >
      {/* Top accent line */}
      <div className={cn('absolute top-0 left-6 right-6 h-px opacity-50', accent.bg)} />

      {/* Icon */}
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-4', accent.bg, `border ${accent.border}`)}>
        <Icon size={16} className={accent.icon} />
      </div>

      {/* Value — Cal Sans heading font */}
      <div className={cn('font-heading text-3xl font-semibold tracking-tight mb-1', accent.text)}>
        {value}
      </div>

      {/* Label — Montserrat uppercase */}
      <div className="text-xs font-medium text-ink-700/50 uppercase tracking-widest mb-2 font-sans">
        {label}
      </div>

      {subValue && (
        <div className="text-xs font-mono text-ink-700/50">{subValue}</div>
      )}
      {trend && (
        <div className={cn('text-xs font-mono mt-1', trend.positive ? 'text-[#bd632f]' : 'text-crimson-500')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}

      {/* Blob */}
      <div className={cn('absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30', accent.blob)} />
    </motion.div>
  )
}

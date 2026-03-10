'use client'
import type { LucideIcon } from 'lucide-react'

interface DisplayCardProps {
  className?: string
  icon?: LucideIcon
  iconColor?: string
  iconBg?: string
  title?: string
  value?: string
  description?: string
  sub?: string
  trend?: string
  trendPositive?: boolean
  accentColor?: string
  delay?: number
}

export function DisplayCard({
  className = '',
  icon: Icon,
  iconColor = 'text-ocean',
  iconBg = 'bg-ocean/12',
  title = 'Metric',
  value = '—',
  description = '',
  sub = '',
  trend = '',
  trendPositive = true,
  accentColor = '#006989',
  delay = 0,
}: DisplayCardProps) {
  return (
    <div
      className={[
        /* base */
        'relative flex flex-col justify-between',
        'w-72 h-40',
        '-skew-y-[7deg]',
        'rounded-2xl',
        /* glass */
        'bg-white/70 backdrop-blur-2xl',
        'border-2 border-white/50',
        /* spacing */
        'px-5 py-4',
        /* after-edge fade */
        'after:absolute after:-right-1 after:top-[-6%] after:h-[112%] after:w-52',
        'after:bg-gradient-to-l after:from-[#ddeaf2] after:to-transparent after:content-[""] after:pointer-events-none',
        /* transition */
        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'select-none',
        className,
      ].join(' ')}
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)`,
      }}
    >
      {/* Top */}
      <div className="flex items-center gap-2.5 z-10 relative">
        {Icon && (
          <span className={`inline-flex rounded-xl p-1.5 ${iconBg}`}>
            <Icon size={16} className={iconColor} />
          </span>
        )}
        <p className="font-display-800 text-navy/85 leading-tight" style={{ fontSize: 15, fontWeight: 800 }}>{title}</p>
      </div>

      {/* Value */}
      <p className="font-display z-10 relative leading-none" style={{ fontSize: 'clamp(24px,3vw,36px)', color: accentColor }}>{value}</p>

      {/* Bottom */}
      <div className="z-10 relative">
        <p className="font-sans text-navy/55 leading-tight" style={{ fontSize: 12 }}>{description}</p>
        {sub && <p className="font-mono text-navy/40 mt-0.5" style={{ fontSize: 10 }}>{sub}</p>}
        {trend && (
          <p className="font-mono mt-1" style={{ fontSize: 11, color: trendPositive ? '#006989' : '#a70b0b' }}>
            {trendPositive ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  )
}

interface DisplayCardsProps {
  cards: DisplayCardProps[]
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  return (
    <div className="card-stack">
      {cards.map((props, i) => (
        <DisplayCard key={i} {...props} />
      ))}
    </div>
  )
}

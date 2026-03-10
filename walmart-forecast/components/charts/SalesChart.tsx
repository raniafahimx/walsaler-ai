'use client'
import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Brush, ReferenceLine } from 'recharts'
import { salesChartData } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays, TrendingUp } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const actual    = payload.find((p: any) => p.dataKey === 'actual')?.value    ?? 0
  const predicted = payload.find((p: any) => p.dataKey === 'predicted')?.value ?? 0
  const diff = actual - predicted
  return (
    <div className="bg-white/93 border border-ocean/16 rounded-xl p-3.5 backdrop-blur-xl shadow-card min-w-[200px]">
      <p className="font-mono text-navy/48 mb-2.5 uppercase tracking-wider" style={{ fontSize: 10 }}>{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-7 items-center">
          <span className="flex items-center gap-1.5 text-navy/65" style={{ fontSize: 12 }}>
            <span className="w-2 h-2 rounded-full bg-ocean inline-block" /> Actual
          </span>
          <span className="font-mono font-semibold text-ocean" style={{ fontSize: 12 }}>{formatCurrency(actual)}</span>
        </div>
        <div className="flex justify-between gap-7 items-center">
          <span className="flex items-center gap-1.5 text-navy/65" style={{ fontSize: 12 }}>
            <span className="w-2 h-2 rounded-full bg-rose inline-block" /> Predicted
          </span>
          <span className="font-mono font-semibold text-rose" style={{ fontSize: 12 }}>{formatCurrency(predicted)}</span>
        </div>
        <div className="border-t border-ocean/10 pt-1.5 flex justify-between items-center">
          <span className="text-navy/45" style={{ fontSize: 11 }}>Δ Error</span>
          <span className={`font-mono font-semibold ${diff >= 0 ? 'text-forest' : 'text-crimson'}`} style={{ fontSize: 11 }}>
            {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function SalesChart() {
  const holidayPoints = salesChartData.filter(d => d.isHoliday)
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      id="analytics"
      className="glass-strong rounded-3xl p-6 border border-ocean/13 shadow-card"
    >
      {/* Header — smaller */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-display text-navy flex items-center gap-2"
            style={{ fontSize: 'clamp(22px,2.5vw,34px)', fontWeight: 800, lineHeight: '1.1' }}>
            <TrendingUp size={18} className="text-ocean flex-shrink-0" />
            Actual vs. Predicted<br />Weekly Sales
          </h2>
          <p className="font-sans text-navy/50 mt-1" style={{ fontSize: 12 }}>
            Aggregated across all 45 stores · drag brush to zoom into holiday peaks
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="flex items-center gap-1.5 text-navy/60" style={{ fontSize: 11 }}>
            <span className="w-3 h-0.5 bg-ocean rounded-full inline-block" /> Actual
          </span>
          <span className="flex items-center gap-1.5 text-navy/60" style={{ fontSize: 11 }}>
            <span className="w-3 h-0.5 bg-rose rounded-full inline-block border-dashed" /> Predicted
          </span>
          <span className="flex items-center gap-1.5 text-navy/60" style={{ fontSize: 11 }}>
            <CalendarDays size={11} className="text-forest" /> Holiday
          </span>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesChartData} margin={{ top: 5, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gAct" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#006989" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#006989" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ad343e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ad343e" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,105,137,0.07)" vertical={false} />
            <XAxis dataKey="label"
              tick={{ fontSize: 10, fill: 'rgba(19,64,116,0.45)', fontFamily: 'Geist Mono, monospace' }}
              axisLine={false} tickLine={false} interval={8} />
            <YAxis tickFormatter={v => formatCurrency(v)}
              tick={{ fontSize: 10, fill: 'rgba(19,64,116,0.45)', fontFamily: 'Geist Mono, monospace' }}
              axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            {holidayPoints.map(p => (
              <ReferenceLine key={p.date} x={p.label}
                stroke="rgba(124,169,130,0.35)" strokeWidth={1} strokeDasharray="4 2" />
            ))}
            <Area type="monotone" dataKey="actual"
              stroke="#006989" strokeWidth={2} fill="url(#gAct)"
              dot={false} activeDot={{ r: 4, fill: '#006989', strokeWidth: 0 }} />
            <Area type="monotone" dataKey="predicted"
              stroke="#ad343e" strokeWidth={1.8} strokeDasharray="5 3" fill="url(#gPred)"
              dot={false} activeDot={{ r: 4, fill: '#ad343e', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-14 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesChartData} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gBrush" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#006989" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#006989" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="actual" stroke="#00698960" strokeWidth={1} fill="url(#gBrush)" dot={false} />
            <Brush dataKey="label" height={26}
              stroke="rgba(0,105,137,0.18)" fill="rgba(255,255,255,0.38)" travellerWidth={6}
              startIndex={Math.max(0, salesChartData.length - 24)}>
              <AreaChart>
                <Area type="monotone" dataKey="actual" stroke="#006989" fill="none" dot={false} />
              </AreaChart>
            </Brush>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="font-mono text-navy/30 text-center mt-1" style={{ fontSize: 10 }}>
        ↔ drag handles to zoom · holiday peaks in green dashed lines
      </p>
    </motion.div>
  )
}

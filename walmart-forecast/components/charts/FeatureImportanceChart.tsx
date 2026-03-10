'use client'
import { motion } from 'framer-motion'
import { featureImportanceData } from '@/lib/mock-data'
import { Cpu } from 'lucide-react'

const catStyle: Record<string, { bar: string; text: string; bg: string }> = {
  temporal: { bar: '#006989', text: '#006989', bg: 'rgba(0,105,137,0.1)'   },
  store:    { bar: '#134074', text: '#134074', bg: 'rgba(19,64,116,0.08)'  },
  economic: { bar: '#a70b0b', text: '#a70b0b', bg: 'rgba(167,11,11,0.09)' },
  external: { bar: '#7ca982', text: '#243e36', bg: 'rgba(124,169,130,0.1)' },
}

export default function FeatureImportanceChart() {
  const max = Math.max(...featureImportanceData.map(d => d.importance))
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.08 }}
      className="glass-strong rounded-3xl p-6 border border-ocean/12 shadow-card"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-navy flex items-center gap-2" style={{ fontSize: 22, fontWeight: 800 }}>
          <Cpu size={16} className="text-ocean" />
          Feature Importance
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(catStyle).map(([cat, c]) => (
            <span key={cat} className="font-mono rounded-full px-2 py-0.5 border" style={{ fontSize: 9, color: c.text, background: c.bg, borderColor: `${c.bar}28` }}>
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {featureImportanceData.map((item, i) => {
          const pct = (item.importance / max) * 100
          const c = catStyle[item.category] ?? catStyle.store
          return (
            <motion.div key={item.feature}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.035 }}
              className="flex items-center gap-3"
            >
              <div className="w-32 flex-shrink-0 text-right">
                <span className="font-mono truncate block" style={{ fontSize: 11, color: c.text }}>{item.feature}</span>
              </div>
              <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <motion.div
                  className="h-full rounded-full relative"
                  style={{ background: c.bar }}
                  initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.15 + i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/22 to-transparent rounded-full" />
                </motion.div>
              </div>
              <span className="w-10 font-mono text-navy/42 flex-shrink-0 text-right" style={{ fontSize: 10 }}>
                {(item.importance * 100).toFixed(1)}%
              </span>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-ocean/10 flex gap-5 flex-wrap">
        {[
          { dot: '#006989', label: 'Temporal', val: '82.0%' },
          { dot: '#a70b0b', label: 'Economic', val: '4.0%' },
        ].map(({ dot, label, val }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
            <span className="font-mono text-navy/48" style={{ fontSize: 11 }}>{label}</span>
            <span className="font-mono font-bold ml-1" style={{ fontSize: 11, color: dot }}>{val}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

'use client'
import { motion } from 'framer-motion'
import { Shield, GitBranch, Database, Clock } from 'lucide-react'

const stats = [
  { label: 'Validation MAE',  value: '$1,450', icon: Shield,   color: '#006989' },
  { label: 'RMSE',            value: '$3,174', icon: Database,  color: '#a70b0b' },
  { label: 'Features',        value: '25',     icon: GitBranch, color: '#243e36' },
  { label: 'Val Split',       value: 'Apr 12', icon: Clock,     color: '#7ca982' },
]

const models = [
  { name: 'Random Forest',     w: 60, trees: 200, depth: 20, color: '#006989' },
  { name: 'Gradient Boosting', w: 40, trees: 300, depth: 6,  color: '#ad343e' },
]

export default function ModelInfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.55 }}
      id="model"
      className="glass-strong rounded-3xl p-6 border border-ocean/12 shadow-card"
    >
      <h2 className="font-display text-navy mb-5 flex items-center gap-2"
        style={{ fontSize: 22, fontWeight: 800 }}>
        <GitBranch size={16} className="text-ocean" />
        Model Architecture
      </h2>

      <div className="mb-5">
        <div className="font-mono text-navy/45 mb-2 uppercase tracking-wider" style={{ fontSize: 10 }}>Ensemble Weights</div>
        <div className="h-3 rounded-full overflow-hidden flex gap-1">
          {models.map(m => (
            <motion.div key={m.name}
              initial={{ width: 0 }} whileInView={{ width: `${m.w}%` }}
              viewport={{ once: true }} transition={{ duration: 0.85, delay: 0.3 }}
              className="h-full rounded-full relative overflow-hidden"
              style={{ background: `${m.color}30`, border: `1px solid ${m.color}45` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {models.map(m => (
            <span key={m.name} className="font-mono font-bold" style={{ fontSize: 11, color: m.color }}>
              {m.name} {m.w}%
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {models.map(m => (
          <div key={m.name} className="flex items-center justify-between px-3.5 py-2.5 bg-white/38 rounded-xl border border-ocean/10">
            <span className="font-mono font-semibold" style={{ fontSize: 12, color: m.color }}>{m.name}</span>
            <div className="flex gap-3 font-mono text-navy/45" style={{ fontSize: 11 }}>
              <span>{m.trees} trees</span>
              <span>d{m.depth}</span>
              <span className="font-bold" style={{ color: m.color }}>{m.w}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/38 rounded-xl p-3.5 border border-ocean/9">
            <Icon size={13} className="mb-1.5" style={{ color }} />
            <div className="font-mono font-bold mb-0.5" style={{ fontSize: 15, color }}>{value}</div>
            <div className="font-sans text-navy/45" style={{ fontSize: 11 }}>{label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ChevronDown, Calendar, Store, Hash, Sparkles, RotateCcw, TrendingUp } from 'lucide-react'
import { useForecast } from '@/hooks/useForecast'

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number>(0)
  useEffect(() => {
    const start = performance.now()
    const from = display
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1300, 1)
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setDisplay(Math.round(from + (value - from) * e))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])
  return (
    <span className="font-display text-white leading-none" style={{ fontSize: 'clamp(40px,5vw,64px)', fontWeight: 900 }}>
      ${display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}

function SelectField({ label, icon: Icon, value, onChange, children, id }: {
  label: string; icon: typeof Store; value: string;
  onChange: (v: string) => void; children: React.ReactNode; id: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 font-mono text-white/55 uppercase tracking-wider" style={{ fontSize: 10 }}>
        <Icon size={10} className="text-sky/60" />{label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl px-3.5 py-2.5 font-mono text-white cursor-pointer pr-9
                     bg-white/10 border border-white/18 backdrop-blur-sm focus:outline-none
                     focus:border-sky/50 transition-all duration-250 hover:bg-white/15"
          style={{ fontSize: 13 }}
        >
          {children}
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
      </div>
    </div>
  )
}

export default function WhatIfPredictor() {
  const [store, setStore] = useState('1')
  const [dept,  setDept]  = useState('1')
  const [date,  setDate]  = useState('2012-11-02')
  const { data, loading, predict, reset } = useForecast()

  return (
    /* This is rendered as a FULL SECTION from page.tsx — gets the gradient wrapper there */
    <div className="max-w-5xl mx-auto px-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/12 border border-white/20 mb-6">
            <Zap size={11} className="text-sky" />
            <span className="font-mono text-sky/80 uppercase tracking-widest font-semibold" style={{ fontSize: 10 }}>
              Live Predictor
            </span>
          </div>
          <h2 className="font-display text-white leading-none mb-5"
            style={{ fontSize: 'clamp(40px,5vw,70px)', fontWeight: 900, lineHeight: '0.92' }}>
            What&#8209;If<br />
            <span className="text-sky ul-ocean">Predictor</span>
          </h2>
          <p className="font-editorial mb-7" style={{ fontSize: 'clamp(15px,1.4vw,20px)', fontWeight: 200, lineHeight: '1.55', color: 'rgba(255,255,255,0.92)' }}>
            Choose any store, department, and date — the ensemble model returns a{' '}
            <span className="text-sky">precise weekly sales forecast</span> in under a second.
            Powered by 31 engineered features and 421K training samples.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: TrendingUp, text: '91.81% weighted accuracy on held-out data' },
              { icon: Sparkles,   text: '31 features including holidays & economic signals' },
              { icon: Zap,        text: 'Real-time inference via FastAPI ensemble backend' },
            ].map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/65" style={{ fontSize: 13 }}>
                <I size={14} className="text-sky flex-shrink-0" />
                <span className="font-sans">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — form card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-white/10 border border-white/18 backdrop-blur-xl p-6 shadow-glass-dark"
        >
          <div className="flex items-center justify-between mb-5">
            <span className="font-display text-white font-semibold" style={{ fontSize: 18, fontWeight: 800 }}>
              Run a Forecast
            </span>
            {data && (
              <button onClick={reset} className="flex items-center gap-1 text-white/45 hover:text-white transition-colors" style={{ fontSize: 12 }}>
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          <div className="space-y-3.5 mb-5">
            <SelectField label="Store" icon={Store} value={store} onChange={setStore} id="pred-store">
              {Array.from({ length: 45 }, (_, i) => (
                <option key={i + 1} value={i + 1} style={{ background: '#134074' }}>Store {i + 1}</option>
              ))}
            </SelectField>

            <SelectField label="Department" icon={Hash} value={dept} onChange={setDept} id="pred-dept">
              {[1,2,3,4,5,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
                31,32,33,34,35,36,37,38,40,41,42,44,45,46,47,48,49,51,52,54,55,56,58,59,60,
                67,71,72,74,79,80,81,82,83,85,87,90,91,92,93,94,95,97,98].map(d => (
                <option key={d} value={d} style={{ background: '#134074' }}>Dept {d}</option>
              ))}
            </SelectField>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-mono text-white/55 uppercase tracking-wider" style={{ fontSize: 10 }}>
                <Calendar size={10} className="text-sky/60" />DATE
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 font-mono text-white bg-white/10 border border-white/18
                           backdrop-blur-sm focus:outline-none focus:border-sky/50 transition-all duration-250"
                style={{ fontSize: 13 }} />
            </div>
          </div>

          {/* Predict button */}
          <button
            onClick={() => predict({ store: Number(store), dept: Number(dept), date })}
            disabled={loading}
            className="w-full py-3 rounded-xl font-display font-semibold text-navy
                       bg-sky hover:bg-white transition-all duration-350
                       disabled:opacity-55 disabled:cursor-not-allowed
                       relative overflow-hidden active:scale-[0.98]"
            style={{ fontSize: 14, fontWeight: 800, boxShadow: '0 4px 18px rgba(144,219,244,0.35)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                Forecasting…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={15} />
                Generate Forecast
              </span>
            )}
            {loading && <div className="absolute inset-0 shimmer opacity-20" />}
          </button>

          {/* Result */}
          <AnimatePresence>
            {data && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-5 pt-5 border-t border-white/12"
              >
                <div className="font-mono text-white/45 uppercase tracking-wider mb-2" style={{ fontSize: 10 }}>
                  Predicted Weekly Sales
                </div>
                <AnimatedCounter value={data.predicted_sales} />
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="font-mono bg-sky/18 border border-sky/28 text-sky px-2.5 py-1 rounded-full" style={{ fontSize: 10 }}>
                    Store {data.store}
                  </span>
                  <span className="font-mono bg-white/10 border border-white/15 text-white/55 px-2.5 py-1 rounded-full" style={{ fontSize: 10 }}>
                    Dept {data.dept}
                  </span>
                  <span className="font-mono bg-white/10 border border-white/15 text-white/55 px-2.5 py-1 rounded-full" style={{ fontSize: 10 }}>
                    {data.date}
                  </span>
                </div>
                <p className="font-mono text-white/30 mt-2 leading-relaxed" style={{ fontSize: 10 }}>{data.model}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

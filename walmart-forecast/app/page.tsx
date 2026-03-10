'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import NavBar from '@/components/layout/NavBar'
import HeroSection from '@/components/layout/HeroSection'
import SalesChart from '@/components/charts/SalesChart'
import FeatureImportanceChart from '@/components/charts/FeatureImportanceChart'
import WhatIfPredictor from '@/components/forms/WhatIfPredictor'
import BatchUpload from '@/components/forms/BatchUpload'
import ModelInfoCard from '@/components/ui/ModelInfoCard'
import GlassFilter from '@/components/ui/GlassFilter'
import {
  Activity, ArrowRight, BarChart3, Brain, Cpu, Leaf, Zap,
  Database, GitBranch, LineChart, BookOpen, Code2, FlaskConical,
  CheckCircle2, Layers, Search, Combine
} from 'lucide-react'

/* ── Section tag ── */
function Tag({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5
      ${light ? 'bg-white/10 border-white/20 text-white/65' : 'bg-ocean/6 border-ocean/13 text-ocean/65'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${light ? 'bg-white/55' : 'bg-ocean/55'}`} />
      <span className="font-mono uppercase tracking-widest font-semibold" style={{ fontSize: 10 }}>{children}</span>
    </div>
  )
}

/* ── Feature card ── */
function FCard({ icon: Icon, title, body, accent = '#006989', delay = 0, dark = false }: {
  icon: typeof Zap; title: string; body: string; accent?: string; delay?: number; dark?: boolean
}) {
  const [h, setH] = useState(false)
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="rounded-2xl p-5 border cursor-default hover-glow relative overflow-hidden"
      style={{
        background: dark ? `rgba(255,255,255,0.06)` : 'rgba(255,255,255,0.62)',
        borderColor: h ? `${accent}40` : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,105,137,0.11)',
        backdropFilter: dark ? 'blur(12px)' : 'blur(20px)',
        WebkitBackdropFilter: dark ? 'blur(12px)' : 'blur(20px)',
        boxShadow: h ? `0 10px 28px ${accent}20` : '0 2px 16px rgba(0,0,0,0.06)',
        opacity: 1,
        transform: `translateY(${h ? -4 : 0}px)`,
        transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3.5"
        style={{ background: `${accent}18` }}>
        <Icon size={17} style={{ color: accent }} />
      </div>
      <h3 className={`font-display mb-2 ${dark ? 'text-white' : 'text-navy'}`}
        style={{ fontSize: 'clamp(18px,2vw,24px)', fontWeight: 800 }}>{title}</h3>
      <p className="font-sans leading-relaxed" style={{ fontSize: 12.5, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(19,64,116,0.55)' }}>{body}</p>
    </div>
  )
}

/* ── How step ── */
function HowStep({ num, title, body, icon: Icon, accent = '#006989', delay = 0 }: {
  num: string; title: string; body: string; icon: typeof Zap; accent?: string; delay?: number
}) {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold border-2
                        group-hover:scale-105 transition-transform duration-250"
          style={{ background: `${accent}10`, borderColor: `${accent}22`, color: accent, fontSize: 13 }}>
          {num}
        </div>
        <div className="w-px flex-1 min-h-6" style={{ background: `${accent}15` }} />
      </div>
      <div className="pb-7">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon size={14} style={{ color: accent }} />
          <h4 className="font-display text-navy" style={{ fontSize: 18, fontWeight: 800 }}>{title}</h4>
        </div>
        <p className="font-sans text-navy/52 leading-relaxed" style={{ fontSize: 13 }}>{body}</p>
      </div>
    </div>
  )
}

/* ── Stat box ── */
function StatBox({ val, label, sub, accent = '#006989' }: { val: string; label: string; sub: string; accent?: string }) {
  const [h, setH] = useState(false)
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className="text-center"
      style={{ transform: h ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.25s ease' }}
    >
      <div className="font-display leading-none mb-1.5" style={{ fontSize: 'clamp(32px,3.8vw,56px)', color: accent, fontWeight: 900 }}>{val}</div>
      <div className="font-sans text-navy font-semibold mb-0.5" style={{ fontSize: 13 }}>{label}</div>
      <div className="font-mono text-navy/40 uppercase tracking-wider" style={{ fontSize: 9.5 }}>{sub}</div>
    </div>
  )
}

export default function Dashboard() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal,.reveal-left,.reveal-right')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="min-h-screen relative">
      <GlassFilter />

      {/* CSS-only ambient blobs — zero JS */}
      <div className="ambient-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>

      <NavBar />

      <main className="relative z-10">
        <HeroSection />

        {/* ═══ BUILT FOR PRECISION — dark radial gradient ═══ */}
        <section className="relative py-22 overflow-hidden section-dark">
          {/* Texture */}
          <div className="absolute inset-0 texture-overlay opacity-60 pointer-events-none" />
          {/* Grid lines subtle */}
          <div className="absolute inset-0 opacity-8 pointer-events-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2390dbf4' stroke-opacity='0.18' stroke-width='1'%3E%3Cpath d='M40 0L0 0 0 40'/%3E%3C/g%3E%3C/svg%3E\")" }} />

          <div className="relative max-w-6xl mx-auto px-6" style={{ paddingTop: '5.5rem', paddingBottom: '5.5rem' }}>
            <div className="text-center mb-11 reveal">
              <Tag light>Why Walsaler.ai</Tag>
              <h2 className="font-display text-white leading-none mb-4"
                style={{ fontSize: 'clamp(36px,5vw,66px)', fontWeight: 900, lineHeight: '0.92' }}>
                Built for <span className="ul-sky text-sky">precision.</span>
                <br />Not guesswork.
              </h2>
              {/* ← WHITE text as requested */}
              <p className="font-editorial max-w-2xl mx-auto" style={{ fontSize: 'clamp(15px,1.5vw,20px)', fontWeight: 200, lineHeight: '1.6', color: 'rgba(255,255,255,0.82)' }}>
                Most forecasting tools stop at trend lines. We go deeper — 25 engineered features,
                lag signals, rolling averages, and real economic indicators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Brain,    title: 'Ensemble Learning',  body: 'Random Forest + Gradient Boosting in a 60/40 split delivers superior accuracy over any single model.',                accent: '#90dbf4' },
                { icon: Zap,      title: '25 Features',        body: 'Lag signals, rolling averages, holiday flags, economic indicators — every variable that moves the needle.',             accent: '#ad343e' },
                { icon: Leaf,     title: 'Zero Setup',         body: 'Pick a store, department, and date. Get a prediction in under a second with full model transparency.',                   accent: '#7ca982' },
                { icon: Database, title: '421K Records',       body: '3 years of weekly data across 45 Walmart stores and 81 departments — dense, diverse, production-ready.',                accent: '#006989' },
                { icon: LineChart,title: 'Holiday-Aware',      body: 'Special event flags for Thanksgiving, Christmas, Labor Day and 5 other peak weeks boost forecast precision.',            accent: '#a70b0b' },
                { icon: Cpu,      title: 'Real-Time API',      body: 'FastAPI backend serves predictions in under 200ms. Batch up to 500 rows via CSV upload in the same session.',           accent: '#134074' },
              ].map(({ icon, title, body, accent }, i) => (
                <motion.div key={title}
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.06 }}>
                  <FCard icon={icon} title={title} body={body} accent={accent} dark />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ KEY FEATURES ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="reveal text-center mb-11">
            <Tag>Key Features</Tag>
            <h2 className="font-display text-navy leading-none mb-4"
              style={{ fontSize: 'clamp(34px,4.5vw,62px)', fontWeight: 900, lineHeight: '0.92' }}>
              What makes it <span className="text-crimson ul-crimson">powerful.</span>
            </h2>
            <p className="font-editorial text-navy/50 max-w-lg mx-auto"
              style={{ fontSize: 'clamp(14px,1.4vw,19px)', fontWeight: 200, lineHeight: '1.6' }}>
              Six capabilities that separate Walsaler.ai from a basic regression model.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Combine,      title: 'Ensemble Stack',             body: 'Two models trained independently, then blended 60/40. The combined prediction outperforms either alone.',       accent: '#006989', delay: 0     },
              { icon: Search,       title: '31 Engineered Features',     body: 'Lag-4, lag-13 signals, 4-week rolling mean, cyclic sin/cos time encodings, economic indices and holiday flags.', accent: '#ad343e', delay: 0.06  },
              { icon: CheckCircle2, title: 'Holiday Weights',            body: '8 marked holiday weeks receive 5× weight during training — the model never misses peak season demand.',          accent: '#7ca982', delay: 0.12  },
              { icon: Layers,       title: 'Time-Safe Validation',       body: 'Validation split at April 2012 ensures zero future leakage. Every metric is computed on unseen data.',            accent: '#134074', delay: 0.18  },
              { icon: Cpu,          title: 'FastAPI Inference',          body: 'Lifespan-managed API loads both models once. Single prediction in ~60ms; batch 500 rows in under 2 seconds.',    accent: '#a70b0b', delay: 0.24  },
              { icon: BarChart3,    title: 'Drift-Ready',                body: 'Models and encoders serialised with joblib. Drop in fresh data and re-run the script to update the ensemble.',   accent: '#243e36', delay: 0.30  },
            ].map(({ icon, title, body, accent, delay }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay }}>
                <FCard icon={icon} title={title} body={body} accent={accent} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ ANALYTICS ═══ */}
        <section className="max-w-7xl mx-auto px-6 pb-18 pt-2">
          <div className="reveal text-center mb-9">
            <Tag>Analytics</Tag>
            <h2 className="font-display text-navy leading-none mb-3"
              style={{ fontSize: 'clamp(32px,4.2vw,58px)', fontWeight: 900, lineHeight: '0.92' }}>
              See the <span className="text-ocean ul-ocean">full picture.</span>
            </h2>
            <p className="font-editorial text-navy/48 max-w-md mx-auto"
              style={{ fontSize: 'clamp(13px,1.3vw,17px)', fontWeight: 200, lineHeight: '1.6' }}>
              Actual vs. predicted across 3 years of weekly Walmart data.
            </p>
          </div>
          <SalesChart />
        </section>

        {/* ═══ WHAT-IF PREDICTOR — standalone gradient section ═══ */}
        <section id="predictor" className="relative py-20 overflow-hidden section-predictor">
          {/* Texture overlay */}
          <div className="absolute inset-0 texture-overlay opacity-55 pointer-events-none" />
          {/* Glow centers */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(0,112,144,0.3) 0%,transparent 65%)', filter: 'blur(40px)' }} />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(129,23,27,0.25) 0%,transparent 65%)', filter: 'blur(40px)' }} />
          <WhatIfPredictor />
        </section>

        {/* ═══ HOW I DID IT ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="reveal">
                <Tag>How I Did It</Tag>
                <h2 className="font-display text-navy leading-none mb-3"
                  style={{ fontSize: 'clamp(32px,4.2vw,58px)', fontWeight: 900, lineHeight: '0.92' }}>
                  From raw CSV to<br />
                  <span className="text-forest ul-forest">production API.</span>
                </h2>
                <p className="font-editorial text-navy/50 mb-7"
                  style={{ fontSize: 'clamp(13px,1.3vw,17px)', fontWeight: 200, lineHeight: '1.6' }}>
                  The entire pipeline — from data cleaning to a live forecasting endpoint — was built in Python.
                  No AutoML. No shortcuts. Every design decision is explained below.
                </p>
              </div>
              <div className="reveal-left">
                <HowStep num="01" icon={Database}     title="Data Ingestion & Merge"  accent="#006989"
                  body="Four Kaggle CSVs (train, test, features, stores) merged on Store + Date. Missing MarkDowns → 0, CPI/Unemployment → forward-fill. Result: 421K clean rows." />
                <HowStep num="02" icon={GitBranch}    title="Feature Engineering"      accent="#ad343e"
                  body="31 features derived: lag-4, lag-13 weekly sales, 4-week rolling mean, cyclic sin/cos encodings, 8 holiday flags, store type dummies, and all 5 MarkDown columns." />
                <HowStep num="03" icon={FlaskConical} title="Model Training"           accent="#7ca982"
                  body="RandomForest (200 trees, d20) + GradientBoosting (300 trees, d6, lr 0.08) trained with holiday-weighted WMAE loss. Validation split at April 2012." />
                <HowStep num="04" icon={Combine}      title="Ensemble & Serialise"    accent="#243e36"
                  body="Final prediction = 0.6×RF + 0.4×GB. Both models, LabelEncoder, and metadata serialised with joblib for instant cold-start loading." />
                <HowStep num="05" icon={Code2}        title="FastAPI Endpoint"        accent="#a70b0b"
                  body="Lifespan-managed FastAPI exposes /predict and /predict/batch. Preprocessor builds the same 31 features live — inference identical to training." />
              </div>
            </div>
            <div className="space-y-5 reveal-right">
              <ModelInfoCard />
              <FeatureImportanceChart />
            </div>
          </div>
        </section>

        {/* ═══ STATS BAND ═══ */}
        <section className="relative py-18 overflow-hidden">
          {/* Subtle teal stripe */}
          <div className="absolute inset-0 border-y border-ocean/10"
            style={{ background: 'linear-gradient(90deg,rgba(0,105,137,0.04) 0%,rgba(0,105,137,0.08) 50%,rgba(0,105,137,0.04) 100%)' }} />
          <div className="relative max-w-6xl mx-auto px-6" style={{ paddingTop:'4.5rem', paddingBottom:'4.5rem' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              <StatBox val="91.81%" label="Model Accuracy" sub="WMAE-based" accent="#006989" />
              <StatBox val="421K"   label="Training Rows"  sub="3 years"    accent="#a70b0b" />
              <StatBox val="$4.6M"  label="Peak Forecast"  sub="Week 52"    accent="#243e36" />
              <StatBox val="< 1s"   label="Inference Time" sub="Real-time"  accent="#7ca982" />
            </div>
          </div>
        </section>

        {/* ═══ BATCH ═══ */}
        <section id="batch" className="max-w-7xl mx-auto px-6 py-18">
          <div className="reveal text-center mb-9">
            <Tag>Batch Processing</Tag>
            <h2 className="font-display text-navy leading-none mb-3"
              style={{ fontSize: 'clamp(32px,4.2vw,58px)', fontWeight: 900, lineHeight: '0.92' }}>
              Forecast at <span className="text-ocean ul-ocean">scale.</span>
            </h2>
            <p className="font-editorial text-navy/48 max-w-sm mx-auto"
              style={{ fontSize: 'clamp(13px,1.3vw,17px)', fontWeight: 200, lineHeight: '1.6' }}>
              Upload a CSV with Store, Dept, Date — get 500 predictions at once.
            </p>
          </div>
          <BatchUpload />
        </section>

        {/* ═══ CTA ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-display text-navy leading-none mb-4"
              style={{ fontSize: 'clamp(32px,4.2vw,58px)', fontWeight: 900, lineHeight: '0.92' }}>
              Ready to forecast<br />
              <span className="text-ocean ul-ocean">smarter?</span>
            </h2>
            <p className="font-editorial text-navy/48 max-w-xs mx-auto mb-7"
              style={{ fontSize: 'clamp(13px,1.3vw,17px)', fontWeight: 200, lineHeight: '1.6' }}>
              Single prediction or batch season. No setup. Just results.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#predictor"
                className="liquid-glass rounded-xl px-6 py-3 flex items-center gap-2 text-navy font-sans font-semibold
                           border border-ocean/18 hover:border-ocean/35 group"
                style={{ fontSize: 13, transition: 'all 0.25s ease' }}>
                <Zap size={14} className="text-ocean" />
                Try the Predictor
                <ArrowRight size={13} className="text-ocean/42 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a href="#analytics"
                className="rounded-xl px-6 py-3 flex items-center gap-2 font-sans font-semibold text-white
                           bg-ocean hover:bg-ocean-dark"
                style={{ fontSize: 13, transition: 'all 0.25s ease', boxShadow: '0 4px 18px rgba(0,105,137,0.3)' }}>
                <BarChart3 size={14} />
                Explore Analytics
              </a>
            </div>
          </motion.div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-ocean/10 py-7" style={{ background: 'rgba(0,105,137,0.04)' }}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-ocean flex items-center justify-center">
                <Activity size={12} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-navy" style={{ fontSize: 13, fontWeight: 800 }}>
                Walsaler<span className="text-ocean">.ai</span>
              </span>
              <span className="font-mono text-navy/35 hidden sm:block" style={{ fontSize: 10 }}>— Retail Sales Intelligence</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-navy/38" style={{ fontSize: 10 }}>
              <span>RF + GradBoost Ensemble</span>
              <span className="w-px h-3 bg-ocean/15" />
              <span>421K training samples</span>
              <span className="w-px h-3 bg-ocean/15" />
              <span className="text-ocean/52">WMAE 8.19%</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

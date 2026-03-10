'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { Target, Scale, TrendingUp, ArrowRight, Sparkles, ChevronDown, BarChart3, Zap } from 'lucide-react'

// ── Three separate metric cards (horizontal, NOT stacked) ──
interface MetricCardProps {
  icon: typeof Target
  iconColor: string
  iconBg: string
  title: string
  value: string
  desc: string
  sub?: string
  trend?: string
  trendColor?: string
  accentColor: string
  border: string
}

function MetricCard({ icon: Icon, iconColor, iconBg, title, value, desc, sub, trend, trendColor = '#006989', accentColor, border }: MetricCardProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-1 min-w-[200px] max-w-[280px] flex flex-col justify-between rounded-2xl px-5 py-4 cursor-default select-none"
      style={{
        background: 'rgba(255,255,255,0.68)',
        border: `1.5px solid ${hovered ? border : 'rgba(255,255,255,0.6)'}`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px ${border}`
          : '0 6px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
        minHeight: 148,
      }}
    >
      {/* Top */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex rounded-xl p-1.5 ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </span>
        <span className="font-display-800 text-navy/82 leading-tight" style={{ fontSize: 13, fontWeight: 800 }}>{title}</span>
      </div>
      {/* Value */}
      <div className="font-display leading-none my-1" style={{ fontSize: 'clamp(26px,2.8vw,38px)', color: accentColor, fontWeight: 900 }}>{value}</div>
      {/* Bottom */}
      <div>
        <div className="font-sans text-navy/52 leading-snug" style={{ fontSize: 11 }}>{desc}</div>
        {sub && <div className="font-mono text-navy/38 mt-0.5" style={{ fontSize: 9.5 }}>{sub}</div>}
        {trend && <div className="font-mono mt-1.5" style={{ fontSize: 10, color: trendColor }}>↑ {trend}</div>}
      </div>
    </div>
  )
}

const ticker = [
  '91.81% Accuracy','WMAE 8.19%','45 Stores','421K Training Rows',
  '$4.6M Peak','60/40 Ensemble','81 Departments','Walsaler.ai',
  '3 Years of Data','Random Forest','Gradient Boost','Real-time API',
]

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [0.14, 0])
  const [brainHovered, setBrainHovered] = useState(false)

  return (
    <div ref={ref} id="overview" className="relative min-h-screen flex flex-col overflow-hidden">
      {/* BG walmart image — parallax opacity only (no layout shift) */}
      <motion.div
        className="absolute inset-0 hero-bg-img pointer-events-none"
        style={{ opacity: bgOpacity, zIndex: 0 }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-cloud/80 via-sky/12 to-cloud/75 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 bg-grid pointer-events-none" style={{ zIndex: 1 }} />

      {/* Subtle radial glow — pure CSS, no animation */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ zIndex: 1, background: 'radial-gradient(circle at 70% 30%, rgba(0,105,137,0.1) 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ zIndex: 1, background: 'radial-gradient(circle at 30% 70%, rgba(19,64,116,0.08) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-14 w-full flex-1 flex flex-col">

        {/* ── Brain image — CSS float + glow, NO framer-motion on float ── */}
        <div
          className="absolute brain-float brain-glow"
          style={{ right: '-21%', top: '8%', zIndex: 20, cursor: 'pointer' }}
          onMouseEnter={() => setBrainHovered(true)}
          onMouseLeave={() => setBrainHovered(false)}
        >
          <img
            src="/brain.png"
            alt="AI Neural Network Brain"
            className="w-72 md:w-96 lg:w-[520px] h-auto object-contain"
            style={{
              opacity: brainHovered ? 1 : 0.85,
              filter: brainHovered
                ? 'drop-shadow(0 0 60px rgba(0,112,144,0.7)) drop-shadow(0 0 120px rgba(129,23,27,0.3))'
                : undefined,
              transition: 'opacity 0.3s ease, filter 0.3s ease',
              transform: brainHovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
          {brainHovered && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap glass rounded-full px-3 py-1 border border-ocean/20"
              style={{ animation: 'countUp 0.25s ease forwards' }}>
              <span className="font-mono text-ocean font-semibold" style={{ fontSize: 10 }}>91.81% accurate</span>
            </div>
          )}
        </div>

        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-ocean/18 bg-white/40 backdrop-blur-sm">
            <Sparkles size={11} className="text-ocean" />
            <span className="font-mono text-ocean/72 uppercase tracking-widest font-semibold" style={{ fontSize: 10 }}>
              Ensemble ML · 45 Stores · 421K Records
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 max-w-3xl"
        >
          <h1 className="font-display text-navy leading-none mb-4"
            style={{ fontSize: 'clamp(46px,6vw,91px)', lineHeight: '0.9', fontWeight: 900 }}>
            Retail Sales
            <br />
            <span className="text-ocean ul-ocean">Intelligence.</span>
          </h1>
          <p className="font-editorial text-navy/58 max-w-lg"
            style={{ fontSize: 'clamp(16px,1.6vw,22px)', lineHeight: '1.52', fontWeight: 200 }}>
            Walsaler.ai uses a precision-tuned ensemble of{' '}
            <span className="text-navy/80">Random Forest</span> and{' '}
            <span className="text-ocean">Gradient Boosting</span>{' '}
            trained on <span className="ul-crimson text-navy/78">421K weekly records</span>{' '}
            — predicting future sales with 91.8% accuracy.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="flex flex-wrap gap-3 mb-14"
        >
          <a href="#predictor"
            className="liquid-glass rounded-xl px-5 py-2.5 flex items-center gap-2 text-navy font-sans font-semibold
                       border border-ocean/18 hover:border-ocean/36 group"
            style={{ fontSize: 13 }}>
            <Zap size={14} className="text-ocean" />
            Try the Predictor
            <ArrowRight size={13} className="text-ocean/45 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
          <a href="#analytics"
            className="liquid-glass rounded-xl px-5 py-2.5 flex items-center gap-2 text-ocean font-sans font-semibold
                       border border-ocean/18 hover:border-ocean/36"
            style={{ fontSize: 13 }}>
            <BarChart3 size={14} />
            View Analytics
          </a>
        </motion.div>

        {/* ── THREE SEPARATE METRIC CARDS (horizontal row) ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="metric-cards">
            <MetricCard
              icon={Target} iconColor="text-ocean" iconBg="bg-ocean/12"
              title="Model Accuracy" value="91.81%"
              desc="WMAE 8.19% · RF + Gradient Boost"
              sub="Ensemble of 2 models, 31 features"
              trend="vs 87% single-model baseline"
              trendColor="#006989" accentColor="#006989"
              border="rgba(0,105,137,0.35)"
            />
            <MetricCard
              icon={Scale} iconColor="text-rose" iconBg="bg-rose/10"
              title="Ensemble Weight" value="60 / 40"
              desc="Random Forest · Gradient Boost"
              sub="200 trees d20 & 300 trees d6"
              trendColor="#ad343e" accentColor="#ad343e"
              border="rgba(173,52,62,0.35)"
            />
            <MetricCard
              icon={TrendingUp} iconColor="text-forest" iconBg="bg-forest/12"
              title="Peak Forecast" value="$4.60M"
              desc="Week 52 · Holiday Season 2012"
              trend="+16.2% vs prior week"
              trendColor="#243e36" accentColor="#243e36"
              border="rgba(36,62,54,0.35)"
            />
          </div>
        </motion.div>

        {/* ── STATS ROW (horizontal under cards) ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-10 flex items-center gap-10 flex-wrap"
        >
          {[
            { v: '421K', l: 'Training Records', c: '#006989' },
            { v: '45',   l: 'Stores Covered',   c: '#a70b0b' },
            { v: '81',   l: 'Departments',       c: '#243e36' },
            { v: '3',    l: 'Years of Data',     c: '#7ca982' },
          ].map(({ v, l, c }, i) => (
            <div key={l} className="flex items-baseline gap-3">
              <span className="font-display leading-none" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: c, fontWeight: 900 }}>{v}</span>
              <span className="font-mono text-navy/42 uppercase tracking-wider hidden sm:block" style={{ fontSize: 10 }}>{l}</span>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          className="mt-12 flex flex-col items-center gap-1.5">
          <span className="font-mono text-navy/28 uppercase tracking-widest" style={{ fontSize: 9 }}>Scroll to explore</span>
          <div style={{ animation: 'bfloat3 2s ease-in-out infinite' }}>
            <ChevronDown size={15} className="text-ocean/32" />
          </div>
        </motion.div>
      </div>

      {/* Ticker */}
      <div className="relative z-10 border-y border-ocean/10 bg-white/16 backdrop-blur-sm overflow-hidden py-2">
        <div className="marquee-track">
          {[...Array(2)].map((_, r) => (
            <span key={r} className="flex items-center">
              {ticker.map((t, i) => (
                <span key={i} className="flex items-center gap-3 mx-6 font-mono text-ocean/55 font-medium whitespace-nowrap" style={{ fontSize: 10.5 }}>
                  <span className="w-1 h-1 rounded-full bg-ocean/30 flex-shrink-0" />
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

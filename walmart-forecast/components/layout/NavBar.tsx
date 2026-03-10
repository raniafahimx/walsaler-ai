'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Activity, Zap, Layers, Upload, Cpu } from 'lucide-react'

const navItems = [
  { name: 'Overview',  href: '#overview',  icon: BarChart3 },
  { name: 'Forecast',  href: '#predictor', icon: Zap       },
  { name: 'Analytics', href: '#analytics', icon: Layers    },
  { name: 'Batch',     href: '#batch',     icon: Upload    },
  { name: 'Model',     href: '#model',     icon: Cpu       },
]

export default function NavBar() {
  const [active,   setActive]   = useState('Overview')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    /* CENTRED — left-1/2 -translate-x-1/2 */
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max"
    >
      <div className={`flex items-center gap-0.5 px-2 py-1.5 rounded-full border transition-all duration-400
        ${scrolled
          ? 'bg-white/82 border-ocean/22 backdrop-blur-2xl shadow-glass'
          : 'bg-white/58 border-ocean/14 backdrop-blur-xl shadow-glass'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-1 mr-1">
          <div className="w-6 h-6 rounded-lg bg-ocean flex items-center justify-center">
            <Activity size={12} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xs text-navy hidden sm:block" style={{ fontSize: 13 }}>
            Walsaler<span className="text-ocean">.ai</span>
          </span>
        </div>

        <div className="w-px h-4 bg-ocean/14 mx-0.5" />

        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = active === name
          return (
            <a
              key={name}
              href={href}
              onClick={() => setActive(name)}
              className="relative cursor-pointer px-3.5 py-2 rounded-full font-sans font-semibold
                         text-navy/60 hover:text-navy transition-colors duration-150"
              style={{ fontSize: 13 }}
            >
              <span className="hidden md:inline">{name}</span>
              <span className="md:hidden"><Icon size={15} strokeWidth={2.5} /></span>

              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 rounded-full bg-ocean/8 -z-10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                >
                  {/* Tubelight bar + glow */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-ocean rounded-t-full">
                    <div className="absolute w-12 h-6 bg-ocean/20 rounded-full blur-lg -top-2 -left-2" />
                    <div className="absolute w-8  h-5 bg-ocean/22 rounded-full blur-md -top-1.5 left-0" />
                    <div className="absolute w-4  h-3 bg-sky/50   rounded-full blur-sm  top-0  left-2" />
                  </div>
                </motion.div>
              )}
            </a>
          )
        })}

        {/* Live badge */}
        <div className="ml-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ocean/10 border border-ocean/18">
          <span className="w-1.5 h-1.5 rounded-full bg-ocean animate-pulse" />
          <span className="font-mono font-bold text-ocean tracking-wider" style={{ fontSize: 10 }}>LIVE</span>
        </div>
      </div>
    </motion.nav>
  )
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cloud:     '#e7ecef',
        ocean:     '#006989',
        sky:       '#90dbf4',
        navy:      '#134074',
        crimson:   '#a70b0b',
        rose:      '#ad343e',
        forest:    '#7ca982',
        dark:      '#243e36',
        'ocean-dark':  '#005570',
        'sky-mid':     '#60c4e8',
      },
      fontFamily: {
        display: ['Athletics', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        body:    ['"Editorial New"', 'Georgia', 'serif'],
        mono:    ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
        sans:    ['"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'hero':    ['clamp(52px,6.5vw,91px)',  { lineHeight: '0.9', letterSpacing: '-0.03em' }],
        'h1':      ['clamp(42px,5.5vw,70px)',  { lineHeight: '0.95', letterSpacing: '-0.025em' }],
        'h2':      ['clamp(32px,4vw,56px)',    { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'h3':      ['clamp(22px,2.5vw,36px)',  { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'sub':     ['clamp(16px,1.8vw,24px)',  { lineHeight: '1.5' }],
        'body':    ['clamp(14px,1.2vw,18px)',  { lineHeight: '1.7' }],
        'label':   ['clamp(10px,0.9vw,12px)',  { lineHeight: '1.4', letterSpacing: '0.12em' }],
        'display': ['clamp(60px,8vw,112px)',   { lineHeight: '0.88', letterSpacing: '-0.04em' }],
      },
      backgroundImage: {
        'site': 'linear-gradient(145deg,#e7ecef 0%,#c8dce8 50%,#b0cfe0 100%)',
        'dark-section': 'linear-gradient(135deg,#243e36 0%,#1a2e28 100%)',
        'crimson-section': 'linear-gradient(135deg,#a70b0b 0%,#7d0808 100%)',
        'predictor-grad': 'linear-gradient(135deg,#134074 0%,#006989 50%,#243e36 100%)',
        'grid': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23006989' stroke-opacity='0.07' stroke-width='1'%3E%3Cpath d='M40 0L0 0 0 40'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'float':      'float 8s ease-in-out infinite',
        'float-slow': 'float 14s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow':  'spin 25s linear infinite',
        'marquee':    'marquee 28s linear infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'glow':       'glow 3s ease-in-out infinite',
        'brain-float':'brainFloat 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%':     { transform: 'translateY(-20px) rotate(1.5deg)' },
        },
        brainFloat: {
          '0%,100%': { transform: 'translateY(0) scale(1) rotate(-2deg)' },
          '33%':     { transform: 'translateY(-12px) scale(1.03) rotate(1deg)' },
          '66%':     { transform: 'translateY(-6px) scale(0.98) rotate(-1deg)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        glow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(0,105,137,0.3)' },
          '50%':     { boxShadow: '0 0 50px rgba(0,105,137,0.6), 0 0 80px rgba(0,105,137,0.2)' },
        },
      },
      boxShadow: {
        'glass':       '0 8px 32px rgba(0,105,137,0.1), inset 0 1px 0 rgba(255,255,255,0.7)',
        'glass-hover': '0 16px 48px rgba(0,105,137,0.18), inset 0 1px 0 rgba(255,255,255,0.85)',
        'card':        '0 2px 20px rgba(19,64,116,0.08)',
        'card-hover':  '0 8px 36px rgba(19,64,116,0.16)',
        'ocean':       '0 6px 24px rgba(0,105,137,0.35)',
        'crimson':     '0 6px 24px rgba(167,11,11,0.35)',
        'dark':        '0 6px 24px rgba(36,62,54,0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}

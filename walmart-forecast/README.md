# Walsaler.ai — Frontend

> Next.js 15 frontend for the Walsaler.ai retail sales forecasting platform.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · Recharts

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> The app runs in **demo mode** automatically if the FastAPI backend is offline — the `useForecast` hook falls back to realistic mock predictions.

---

## 🔧 Environment

Create a `.env.local` file (already included, not committed):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change the URL if your FastAPI backend runs on a different port.

---

## 📁 Structure

```
walmart-forecast/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Main page — all sections assembled
│   └── globals.css             # Design tokens, glass utils, animations
├── components/
│   ├── layout/
│   │   ├── NavBar.tsx          # Floating glass nav with tubelight animation
│   │   └── HeroSection.tsx     # Hero — cards, stats, robot image, ticker
│   ├── charts/
│   │   ├── SalesChart.tsx      # Actual vs Predicted area chart
│   │   └── FeatureImportanceChart.tsx  # Horizontal bar chart
│   ├── forms/
│   │   ├── WhatIfPredictor.tsx # Store/dept/date predictor
│   │   └── BatchUpload.tsx     # CSV drag-and-drop batch uploader
│   └── ui/
│       ├── MetricCard.tsx      # Reusable KPI card
│       ├── ModelInfoCard.tsx   # Model architecture detail card
│       ├── DisplayCards.tsx    # Stacked glass display cards
│       └── GlassFilter.tsx     # SVG liquid glass distortion filter
├── hooks/
│   └── useForecast.ts          # POST /predict with mock fallback
├── lib/
│   ├── utils.ts                # cn(), formatCurrency()
│   └── mock-data.ts            # Chart data, feature importances
└── public/
    ├── brain.png               # Hero robot image (add manually)
    └── bg_walmart.jpg          # Hero background (add manually)
```

---

## 🎨 Design System

| Token | Hex | Usage |
|-------|-----|-------|
| `ocean` | `#006989` | Primary brand, actual data line |
| `sky` | `#90dbf4` | Accent on dark sections |
| `navy` | `#134074` | Body text, headings |
| `crimson` | `#a70b0b` | Error states, accent |
| `rose` | `#ad343e` | Predicted line, ensemble card |
| `forest` | `#7ca982` | Holiday markers, step accents |
| `dark` | `#243e36` | Dark section backgrounds |
| `cloud` | `#e7ecef` | Page background base |

**Fonts:** Athletics (headings) · Editorial New (body) · Geist Mono (labels)

---

## 🖼️ Images

These files must be placed in `public/` manually (excluded from git):

| File | Source |
|------|--------|
| `public/brain.png` | Your robot/brain hero image |
| `public/bg_walmart.jpg` | Hero section background |

---

## 📦 Build for Production

```bash
npm run build
npm start
```

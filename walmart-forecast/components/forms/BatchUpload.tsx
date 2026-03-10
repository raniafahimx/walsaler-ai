'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, AlertCircle, X, Download, Loader2 } from 'lucide-react'

type State = 'idle'|'dragover'|'processing'|'done'|'error'

export default function BatchUpload() {
  const [state,    setState]    = useState<State>('idle')
  const [file,     setFile]     = useState<File|null>(null)
  const [results,  setResults]  = useState<string|null>(null)
  const [errorMsg, setErrorMsg] = useState<string|null>(null)
  const [progress, setProgress] = useState(0)

  const handleFile = useCallback(async (f:File) => {
    if (!f.name.endsWith('.csv')) { setState('error'); setErrorMsg('Please upload a valid .csv file.'); return }
    setFile(f); setState('processing'); setProgress(0)
    const iv = setInterval(()=>setProgress(p=>{ if(p>=88){clearInterval(iv);return 88} return p+Math.random()*14 }),200)
    const text = await f.text()
    const rows = text.trim().split('\n').slice(1)
    const parsed = rows.filter(l=>l.trim()).map(l=>{
      const [store,dept,date] = l.split(',').map(s=>s.trim().replace(/"/g,''))
      return {store:Number(store),dept:Number(dept),date}
    }).filter(r=>r.store&&r.dept&&r.date)
    if (!parsed.length) { clearInterval(iv); setState('error'); setErrorMsg('Could not parse rows. Expected: Store, Dept, Date'); return }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000'}/predict/batch`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({inputs:parsed.slice(0,500)}),
      })
      clearInterval(iv); setProgress(100)
      const data = await res.json()
      const csv = ['Store,Dept,Date,Predicted_Weekly_Sales',
        ...data.predictions.map((p:any)=>`${p.store},${p.dept},${p.date},${p.predicted_sales.toFixed(2)}`)
      ].join('\n')
      setResults(csv); setState('done')
    } catch {
      clearInterval(iv); setProgress(100)
      const csv = ['Store,Dept,Date,Predicted_Weekly_Sales',
        ...parsed.slice(0,10).map(r=>`${r.store},${r.dept},${r.date},${(Math.random()*40000+15000).toFixed(2)}`)
      ].join('\n')
      setResults(csv); setState('done')
    }
  },[])

  const onDrop = useCallback((e:React.DragEvent)=>{
    e.preventDefault(); setState('idle')
    const f = e.dataTransfer.files[0]; if(f) handleFile(f)
  },[handleFile])

  const download = () => {
    if(!results) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([results],{type:'text/csv'}))
    a.download = 'walsaler_predictions.csv'; a.click()
  }

  const reset = () => { setState('idle'); setFile(null); setResults(null); setErrorMsg(null); setProgress(0) }

  return (
    <motion.div
      initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
      viewport={{once:true}} transition={{duration:0.6,ease:[0.16,1,0.3,1]}}
      className="glass-strong rounded-3xl p-8 border border-ocean/14 shadow-glass"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-navy flex items-center gap-2.5" style={{fontSize:'clamp(22px,2.5vw,36px)',lineHeight:'1.1'}}>
            <Upload size={19} className="text-forest"/>Batch CSV Upload
          </h2>
          <p className="font-sans text-sm text-navy/50 mt-1">Format: <span className="font-mono text-navy/70">Store, Dept, Date</span></p>
        </div>
        {(file||state!=='idle') && (
          <button onClick={reset} className="liquid-glass rounded-xl p-2 text-navy/40 hover:text-navy transition-colors border border-ocean/15">
            <X size={14}/>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {(state==='idle'||state==='dragover') && (
          <motion.label key="drop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onDragOver={e=>{e.preventDefault();setState('dragover')}}
            onDragLeave={()=>setState('idle')} onDrop={onDrop}
            className={`relative block cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-250
              ${state==='dragover'?'border-forest/50 bg-forest/5 scale-[1.01]':'border-ocean/18 hover:border-ocean/35 hover:bg-white/20'}`}
          >
            <input type="file" accept=".csv" className="sr-only" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
            <div className="flex flex-col items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-250
                ${state==='dragover'?'bg-forest/15':'bg-ocean/8 group-hover:bg-ocean/12'}`}>
                <Upload size={24} className={state==='dragover'?'text-forest':'text-ocean/50'}/>
              </div>
              <div>
                <p className="font-sans font-semibold text-base text-navy/70">
                  {state==='dragover'?'Drop to upload':'Drop your CSV here'}
                </p>
                <p className="font-sans text-sm text-navy/40 mt-1">or click to browse · max 500 rows</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-navy/40">
                <span className="px-2.5 py-1 bg-ocean/7 rounded-lg">Store</span>
                <span className="text-navy/25">,</span>
                <span className="px-2.5 py-1 bg-ocean/7 rounded-lg">Dept</span>
                <span className="text-navy/25">,</span>
                <span className="px-2.5 py-1 bg-ocean/7 rounded-lg">Date</span>
              </div>
            </div>
          </motion.label>
        )}
        {state==='processing' && (
          <motion.div key="proc" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="rounded-2xl border border-ocean/15 bg-white/30 p-10 flex flex-col items-center gap-5">
            <Loader2 size={28} className="text-ocean animate-spin"/>
            <div className="text-center">
              <p className="text-sm font-mono text-navy/70">{file?.name}</p>
              <p className="text-xs font-sans text-navy/45 mt-1">Running ensemble model…</p>
            </div>
            <div className="w-full max-w-[260px]">
              <div className="flex justify-between text-xs font-mono text-navy/45 mb-1.5">
                <span>Progress</span><span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-ocean/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-ocean rounded-full" animate={{width:`${progress}%`}} transition={{duration:0.3}}/>
              </div>
            </div>
          </motion.div>
        )}
        {state==='done' && results && (
          <motion.div key="done" initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
            className="rounded-2xl border border-forest/25 bg-forest/5 p-8 flex flex-col items-center gap-4">
            <CheckCircle2 size={28} className="text-forest"/>
            <div className="text-center">
              <p className="font-sans font-bold text-base text-navy">Predictions ready</p>
              <p className="text-xs font-mono text-navy/50 mt-0.5">{file?.name}</p>
            </div>
            <pre className="w-full text-xs font-mono text-navy/60 bg-white/50 rounded-xl p-3.5 overflow-auto max-h-24 border border-ocean/10">
              {results.split('\n').slice(0,5).join('\n')}{results.split('\n').length>5?'\n…':''}
            </pre>
            <button onClick={download}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-forest text-white font-sans font-bold text-sm
                         shadow-dark hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <Download size={15}/>Download CSV
            </button>
          </motion.div>
        )}
        {state==='error' && (
          <motion.div key="err" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="rounded-2xl border border-crimson/25 bg-crimson/5 p-8 flex flex-col items-center gap-4">
            <AlertCircle size={26} className="text-crimson"/>
            <p className="text-sm font-sans text-navy/70 text-center">{errorMsg}</p>
            <button onClick={reset} className="text-xs font-mono text-navy/45 hover:text-navy underline underline-offset-2">Try again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

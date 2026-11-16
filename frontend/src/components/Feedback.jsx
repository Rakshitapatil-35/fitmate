import { useCallback, useMemo, useState } from 'react'
import { Check, Info, X } from 'lucide-react'
import { ToastContext } from './ToastContext.jsx'
import productFallback from '../assets/hero.png'
import './Feedback.css'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const notify = useCallback((message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { id, message, tone }].slice(-3))
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3800)
  }, [])
  const value = useMemo(() => notify, [notify])
  return <ToastContext.Provider value={value}>{children}<div className="fm-toast-stack" aria-live="polite">{toasts.map((toast) => <div className={`fm-toast fm-toast--${toast.tone}`} role="status" key={toast.id}>{toast.tone === 'success' ? <Check size={16} /> : <Info size={16} />}<span>{toast.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}><X size={15} /></button></div>)}</div></ToastContext.Provider>
}

export function ProductImage({ src, alt, className = '', fallback = productFallback, ...props }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return <img src={failed ? fallback : src} alt={alt} className={`${className} fm-image ${loaded ? 'is-loaded' : ''}`} onLoad={() => setLoaded(true)} onError={() => { setFailed(true); setLoaded(false) }} {...props} />
}

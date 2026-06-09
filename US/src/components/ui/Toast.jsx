import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const config = {
  success: { icon: CheckCircle2, cls: 'toast-success', iconCls: 'text-[#34D399]' },
  error:   { icon: AlertCircle,  cls: 'toast-error',   iconCls: 'text-[#F87171]' },
  info:    { icon: Info,         cls: 'toast-info',    iconCls: 'text-[#60A5FA]' },
}

function ToastItem({ toast }) {
  const { removeToast } = useUIStore()
  const cfg = config[toast.type] ?? config.info
  const Icon = cfg.icon

  useEffect(() => {
    const t = setTimeout(() => removeToast(toast.id), toast.duration ?? 4000)
    return () => clearTimeout(t)
  }, [toast.id])

  return (
    <div className={`toast ${cfg.cls}`}>
      <Icon size={18} className={`${cfg.iconCls} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-ink leading-tight mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm text-[#64748B] leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 rounded-lg text-[#94A3B8] hover:text-ink transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function Toast() {
  const { toasts } = useUIStore()
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}

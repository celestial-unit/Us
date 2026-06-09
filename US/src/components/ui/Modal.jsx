import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

export default function Modal({ name, title, children, onClose }) {
  const { activeModal, closeModal } = useUIStore()
  const backdropRef = useRef(null)
  const isOpen = activeModal === name

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && isOpen) handleClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const handleClose = () => { closeModal(); onClose?.() }

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={(e) => e.target === backdropRef.current && handleClose()}
    >
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-label={title}>
        {/* Handle bar (mobile) */}
        <div className="modal-handle" />

        {/* Header */}
        <div className="modal-header">
          <h2 className="font-display text-[18px] font-semibold text-ink">{title}</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-ink hover:bg-[#F0F9FF] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

import React, { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', inputClassName = '', ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="input-label">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`input-field ${Icon ? '!pl-11' : ''} ${error ? 'error' : ''} ${inputClassName}`}
          {...props}
        />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  )
})

export default Input

export function Textarea({ label, error, className = '', textareaClassName = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <textarea
        className={`input-field resize-y min-h-[100px] ${error ? 'error' : ''} ${textareaClassName}`}
        {...props}
      />
      {error && <p className="input-error">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="relative">
        <select
          className={`input-field appearance-none pr-10 ${error ? 'error' : ''}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  )
}

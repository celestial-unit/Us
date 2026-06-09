import React from 'react'

export default function Card({
  children,
  className = '',
  interactive = false,
  padding = true,
  noBorder = false,
  ...props
}) {
  return (
    <div
      className={`card ${interactive ? 'card-interactive card-hover' : ''} ${
        !padding ? '!p-0' : ''
      } ${noBorder ? '!border-0 !shadow-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, icon: Icon, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {Icon && (
        <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-[#2563EB]" />
        </div>
      )}
      <h3 className="font-display text-[18px] font-semibold text-ink">{children}</h3>
    </div>
  )
}

export function CardSection({ children, className = '' }) {
  return (
    <div className={`border-t border-[#E0F2FE] pt-4 mt-4 ${className}`}>
      {children}
    </div>
  )
}

import React from 'react'

export default function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-14 px-6 text-center animate-float-in ${className}`}>
      {/* Illustration area */}
      {emoji ? (
        <div className="text-5xl mb-4 animate-bounce-once">{emoji}</div>
      ) : Icon ? (
        <div className="w-20 h-20 rounded-3xl bg-[#EFF6FF] flex items-center justify-center mb-4">
          <Icon size={32} className="text-[#7DD3FC]" />
        </div>
      ) : null}

      <h3 className="font-display text-[17px] italic font-semibold text-ink/70 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#64748B] max-w-[260px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

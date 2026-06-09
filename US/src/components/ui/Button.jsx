import React from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost:     'btn btn-ghost',
  danger:    'btn btn-danger',
  blush:     'btn btn-blush',
}

const sizes = {
  sm:  'btn-sm',
  md:  '',
  lg:  'btn-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${variants[variant] ?? variants.primary} ${sizes[size] ?? ''} ${
        (loading || disabled) ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin flex-shrink-0" />}
      {children}
    </button>
  )
}

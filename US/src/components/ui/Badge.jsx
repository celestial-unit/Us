import React from 'react'

const variants = {
  sky:      'badge badge-sky',
  blush:    'badge badge-blush',
  gold:     'badge badge-gold',
  green:    'badge badge-green',
  lavender: 'badge badge-lavender',
  mist:     'badge badge-mist',
  red:      'badge badge-red',
  mint:     'badge badge-mint',
}

export default function Badge({
  children,
  color = 'sky',
  className = '',
  ...props
}) {
  return (
    <span
      className={`${variants[color] ?? variants.sky} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

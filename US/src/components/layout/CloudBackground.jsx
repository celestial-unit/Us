import React from 'react'

/**
 * Static cloud background — no animation for mobile performance.
 * Soft SVG blob shapes at low opacity behind all content.
 */
export default function CloudBackground() {
  return (
    <div className="cloud-bg" aria-hidden="true">
      {/* Cloud 1 — top right (visible mobile + desktop) */}
      <svg
        style={{ position: 'absolute', top: '2%', right: '-4%', width: 340, height: 160, opacity: 0.22 }}
        viewBox="0 0 340 160" fill="none"
      >
        <ellipse cx="170" cy="100" rx="150" ry="55" fill="#BAE6FD" />
        <ellipse cx="100" cy="80"  rx="90"  ry="60" fill="#BAE6FD" />
        <ellipse cx="250" cy="82"  rx="80"  ry="50" fill="#BAE6FD" />
        <ellipse cx="170" cy="65"  rx="110" ry="60" fill="#BAE6FD" />
      </svg>

      {/* Cloud 2 — bottom left (visible mobile + desktop) */}
      <svg
        style={{ position: 'absolute', bottom: '8%', left: '-3%', width: 260, height: 120, opacity: 0.18 }}
        viewBox="0 0 260 120" fill="none"
      >
        <ellipse cx="130" cy="80" rx="120" ry="38" fill="#BAE6FD" />
        <ellipse cx="75"  cy="62" rx="70"  ry="44" fill="#BAE6FD" />
        <ellipse cx="190" cy="64" rx="60"  ry="36" fill="#BAE6FD" />
        <ellipse cx="130" cy="50" rx="95"  ry="46" fill="#BAE6FD" />
      </svg>

      {/* Cloud 3 — middle left (desktop only) */}
      <svg
        className="hidden lg:block"
        style={{ position: 'absolute', top: '38%', left: '5%', width: 200, height: 90, opacity: 0.15 }}
        viewBox="0 0 200 90" fill="none"
      >
        <ellipse cx="100" cy="58" rx="90" ry="28" fill="#BAE6FD" />
        <ellipse cx="58"  cy="46" rx="55" ry="34" fill="#BAE6FD" />
        <ellipse cx="145" cy="48" rx="48" ry="28" fill="#BAE6FD" />
      </svg>

      {/* Cloud 4 — top left (desktop only) */}
      <svg
        className="hidden lg:block"
        style={{ position: 'absolute', top: '15%', left: '20%', width: 180, height: 80, opacity: 0.12 }}
        viewBox="0 0 180 80" fill="none"
      >
        <ellipse cx="90" cy="50" rx="80" ry="26" fill="#BAE6FD" />
        <ellipse cx="52" cy="40" rx="52" ry="32" fill="#BAE6FD" />
        <ellipse cx="132" cy="42" rx="44" ry="26" fill="#BAE6FD" />
      </svg>

      {/* Cloud 5 — bottom right (desktop only) */}
      <svg
        className="hidden lg:block"
        style={{ position: 'absolute', bottom: '22%', right: '12%', width: 220, height: 100, opacity: 0.14 }}
        viewBox="0 0 220 100" fill="none"
      >
        <ellipse cx="110" cy="66" rx="100" ry="32" fill="#BAE6FD" />
        <ellipse cx="65"  cy="52" rx="65"  ry="38" fill="#BAE6FD" />
        <ellipse cx="162" cy="54" rx="55"  ry="30" fill="#BAE6FD" />
        <ellipse cx="110" cy="44" rx="82"  ry="40" fill="#BAE6FD" />
      </svg>

      {/* Subtle golden glow — top right */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: '8%',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(253,230,138,0.18) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

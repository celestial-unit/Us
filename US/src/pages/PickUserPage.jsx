import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import CloudBackground from '../components/layout/CloudBackground'

const PEOPLE = [
  {
    key: 'aziz',
    name: 'Aziz',
    emoji: '💙',
    role: 'Partner 1',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#DBEAFE',
    avatarBg: '#DBEAFE',
  },
  {
    key: 'eya',
    name: 'Eya',
    emoji: '💗',
    role: 'Partner 2',
    color: '#9D174D',
    bg: '#FFF0F6',
    border: '#FBD5E2',
    avatarBg: '#FBD5E2',
  },
]

export default function PickUserPage() {
  const navigate = useNavigate()
  const { selectUser } = useAuthStore()

  const handlePick = (key) => {
    selectUser(key)
    navigate('/', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#F0F9FF' }}
    >
      <CloudBackground />

      <div className="relative z-10 w-full max-w-sm animate-float-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-[56px] mb-3">💙</div>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 36,
              fontWeight: 700,
              color: '#1E293B',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Us
          </h1>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 15,
              color: '#64748B',
              marginTop: 6,
            }}
          >
            Who are you today?
          </p>
        </div>

        {/* Picker cards */}
        <div className="flex flex-col gap-4">
          {PEOPLE.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePick(p.key)}
              className="w-full flex items-center gap-5 p-5 rounded-[20px] transition-all"
              style={{
                background: p.bg,
                border: `2px solid ${p.border}`,
                boxShadow: '0 2px 16px rgba(37,99,235,0.06)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(37,99,235,0.06)'
              }}
            >
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-[28px] flex-shrink-0"
                style={{ background: p.avatarBg }}
              >
                {p.emoji}
              </div>

              {/* Info */}
              <div className="text-left">
                <p
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#1E293B',
                    lineHeight: 1.2,
                  }}
                >
                  {p.name}
                </p>
                <p
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13,
                    color: p.color,
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  {p.role}
                </p>
              </div>

              {/* Arrow */}
              <div className="ml-auto text-[20px]" style={{ color: p.color, opacity: 0.5 }}>
                →
              </div>
            </button>
          ))}
        </div>

        <p
          className="text-center mt-8"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            color: '#94A3B8',
          }}
        >
          Aziz & Eya's private space 🔒
        </p>
      </div>
    </div>
  )
}

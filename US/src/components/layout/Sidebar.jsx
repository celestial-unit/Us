import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, CalendarDays, CheckSquare, Gift, Link2,
  Droplets, Mail, Settings, Heart, LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCoupleStore } from '../../store/coupleStore'

const sections = [
  {
    label: 'Main',
    items: [
      { to: '/',         icon: Home,        label: 'Our Space'          },
      { to: '/calendar', icon: CalendarDays, label: 'Calendar & Plans'  },
      { to: '/tasks',    icon: CheckSquare,  label: 'Tasks & Reminders' },
    ],
  },
  {
    label: 'Together',
    items: [
      { to: '/wishlist', icon: Gift,     label: 'Wishlist & Bucket List' },
      { to: '/links',    icon: Link2,    label: 'Inspiration Board'      },
      { to: '/cycle',    icon: Droplets, label: 'Cycle Tracker'          },
    ],
  },
  {
    label: 'Private',
    items: [
      { to: '/notes',    icon: Mail,     label: 'Notes & Letters' },
      { to: '/settings', icon: Settings, label: 'Settings'        },
    ],
  },
]

export default function Sidebar() {
  const { profile, signOut } = useAuthStore()
  const { couple } = useCoupleStore()

  return (
    <aside className="sidebar hidden lg:flex flex-col" id="sidebar">
      {/* Logo / Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #BAE6FD 0%, #E0F2FE 60%, #F0F9FF 100%)',
          padding: '28px 20px 20px',
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(37,99,235,0.10)' }}
          >
            <Heart size={20} color="#2563EB" fill="#2563EB" />
          </div>
          <div>
            <h1 className="font-display text-[22px] font-bold text-ink leading-none">Us</h1>
            {couple?.couple_name && (
              <p className="text-[12px] text-[#64748B] mt-0.5 font-body">{couple.couple_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Sidebar navigation">
        {sections.map((section) => (
          <div key={section.label} className="mb-5">
            <p
              className="font-body text-[11px] font-semibold uppercase tracking-wider px-3 mb-1.5"
              style={{ color: '#94A3B8' }}
            >
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid #E0F2FE' }}
      >
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F9FF] transition-colors">
          <div
            className="avatar w-9 h-9 text-sm flex-shrink-0 overflow-hidden"
            style={{ background: '#FBD5E2' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span>{profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-ink truncate font-body">
              {profile?.display_name || 'You'}
            </p>
            <p className="text-[11px] text-[#94A3B8] truncate font-body capitalize">
              {profile?.role === 'partner2' ? 'Partner 2' : 'Partner 1'}
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}

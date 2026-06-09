import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, CheckSquare, Gift, MoreHorizontal, X, Link2, Droplets, Mail, Settings } from 'lucide-react'

const mainItems = [
  { to: '/',         icon: Home,        label: 'Home'     },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/tasks',    icon: CheckSquare,  label: 'Tasks'    },
  { to: '/wishlist', icon: Gift,         label: 'Wishlist' },
]

const moreItems = [
  { to: '/links',    icon: Link2,     label: 'Inspiration' },
  { to: '/cycle',    icon: Droplets,  label: 'Cycle'       },
  { to: '/notes',    icon: Mail,      label: 'Notes'       },
  { to: '/settings', icon: Settings,  label: 'Settings'    },
]

export default function BottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav className="bottom-nav lg:hidden" role="navigation" aria-label="Main navigation">
        <div className="flex items-start justify-around w-full px-2">
          {mainItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="nav-item-icon-wrap">
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      color={isActive ? '#2563EB' : '#94A3B8'}
                    />
                  </div>
                  <span className="nav-item-label">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            className={`nav-item ${drawerOpen ? 'active' : ''}`}
            onClick={() => setDrawerOpen(true)}
            aria-label="More"
          >
            <div className="nav-item-icon-wrap">
              <MoreHorizontal
                size={22}
                strokeWidth={1.8}
                color={drawerOpen ? '#2563EB' : '#94A3B8'}
              />
            </div>
            <span className="nav-item-label">More</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-ink/20 backdrop-blur-sm lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[70] lg:hidden animate-slide-up"
            style={{
              background: 'rgba(255,255,255,0.98)',
              borderRadius: '24px 24px 0 0',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
              boxShadow: '0 -4px 32px rgba(37,99,235,0.10)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div style={{ width: 32, height: 4, borderRadius: 2, background: '#E0F2FE' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <span className="font-display text-[15px] font-semibold text-ink">More</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F9FF]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-4 gap-2 px-4 pb-4">
              {moreItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-2 py-3 px-2 rounded-2xl transition-all ${
                      isActive ? 'bg-[#EFF6FF]' : 'hover:bg-[#F0F9FF]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: isActive ? '#DBEAFE' : '#F0F9FF' }}
                      >
                        <Icon size={22} color={isActive ? '#2563EB' : '#94A3B8'} strokeWidth={1.8} />
                      </div>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: isActive ? '#2563EB' : '#94A3B8' }}
                      >
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn(email, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#F0F9FF' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-16 left-8 w-64 h-64 rounded-full" style={{ background: '#FBD5E2', opacity: 0.2, filter: 'blur(60px)' }} />
        <div className="absolute bottom-16 right-8 w-80 h-80 rounded-full" style={{ background: '#BAE6FD', opacity: 0.25, filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[400px] animate-float-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4"
            style={{ background: 'rgba(37,99,235,0.08)' }}
          >
            <Heart size={28} color="#2563EB" fill="#2563EB" />
          </div>
          <h1 className="font-display text-[28px] font-bold text-ink">Welcome back</h1>
          <p className="font-body text-[14px] mt-1" style={{ color: '#64748B' }}>
            Sign in to your shared space 💙
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px 24px' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 bottom-[13px] text-[#94A3B8] hover:text-ink transition-colors"
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-[13px] animate-slide-up"
                style={{ background: '#FEE2E2', color: '#DC2626' }}
              >
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Sign In
            </Button>
          </form>

          <p className="font-body text-[13px] text-center mt-5" style={{ color: '#64748B' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#2563EB' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

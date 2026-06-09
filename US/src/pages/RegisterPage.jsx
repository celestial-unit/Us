import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm)   return setError('Passwords do not match.')
    if (password.length < 6)    return setError('Password must be at least 6 characters.')

    setLoading(true)
    const result = await signUp(email, password)
    if (result.success) {
      navigate('/setup')
    } else {
      setError(result.error || 'Failed to create account.')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#F0F9FF' }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-16 right-8 w-64 h-64 rounded-full" style={{ background: '#FDE68A', opacity: 0.15, filter: 'blur(60px)' }} />
        <div className="absolute bottom-16 left-8 w-80 h-80 rounded-full" style={{ background: '#FBD5E2', opacity: 0.2, filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[400px] animate-float-in">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4"
            style={{ background: 'rgba(251,213,226,0.4)' }}
          >
            <Heart size={28} color="#EC4899" fill="#EC4899" />
          </div>
          <h1 className="font-display text-[28px] font-bold text-ink">Join Us</h1>
          <p className="font-body text-[14px] mt-1" style={{ color: '#64748B' }}>
            Create your shared space together ✨
          </p>
        </div>

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 bottom-[13px] text-[#94A3B8] hover:text-ink transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type={showPw ? 'text' : 'password'}
              icon={Lock}
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-[13px] animate-slide-up"
                style={{ background: '#FEE2E2', color: '#DC2626' }}
              >
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Create Account
            </Button>
          </form>

          <p className="font-body text-[13px] text-center mt-5" style={{ color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#2563EB' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

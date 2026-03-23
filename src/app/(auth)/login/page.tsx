'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/lib/api'
import { decodeToken, getDashboardPath, getDashboardPathFromMembership } from '@/lib/auth'
import { normalizeEmail } from '@/lib/email'
import type { LoginCheckResponse, SchoolMembership } from '@/types/auth'
import {
  Eye, EyeOff, Mail, Lock, KeyRound, ArrowRight, Loader2,
  Building2, ShieldCheck, ChevronRight,
} from 'lucide-react'

const emailSchema = z.object({ email: z.string().email('Enter a valid email') })
const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})
const onboardSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
const otpSchema = z.object({ otp: z.string().length(6, 'OTP must be 6 digits') })

type EmailForm    = z.infer<typeof emailSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type OnboardForm  = z.infer<typeof onboardSchema>
type OTPForm      = z.infer<typeof otpSchema>

type Step = 'email' | 'login' | 'onboard' | 'school-select'

// ─── School Selection Screen ──────────────────────────────────────────────────
function SchoolSelectScreen({
  memberships,
  onSelect,
  onBack,
  loading,
}: {
  memberships: SchoolMembership[]
  onSelect: (m: SchoolMembership) => void
  onBack: () => void
  loading: boolean
}) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 mb-3">
          <Building2 className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Select a School</h2>
        <p className="text-sm text-zinc-500 mt-1">
          You have access to {memberships.length} school{memberships.length > 1 ? 's' : ''}. Choose one to continue.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {memberships.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            disabled={loading}
            className="w-full flex items-center gap-4 p-4 bg-zinc-800/60 border border-zinc-700/60 rounded-xl hover:border-blue-500/40 hover:bg-zinc-800 transition-all text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-400">
                {m.school_name.charAt(0)}
              </span>
            </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{m.school_name}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {m.is_admin && (
                    <span className="text-xs text-purple-400 font-medium">School Admin</span>
                  )}
                  {(m.roles || []).slice(0, 2).map(r => (
                    <span key={r} className="text-xs text-zinc-500 capitalize">{r.replace('_', ' ')}</span>
                  ))}
                </div>
              </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-2 transition-colors"
      >
        Use a different email
      </button>
    </div>
  )
}

// ─── Onboarding Screen ────────────────────────────────────────────────────────
function OnboardScreen({
  email,
  onSuccess,
  onBack,
}: {
  email: string
  onSuccess: () => void
  onBack: () => void
}) {
  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register: regOtp,
    handleSubmit: handleOtp,
    formState: { errors: otpErrors },
  } = useForm<OTPForm>({ resolver: zodResolver(otpSchema) })

  const {
    register: regPass,
    handleSubmit: handlePass,
    formState: { errors: passErrors },
  } = useForm<OnboardForm>({ resolver: zodResolver(onboardSchema) })

  async function sendOTP() {
    setError(''); setLoading(true)
    try {
      await api.post('/auth/otp/send/', { email, purpose: 'onboard' })
      setOtpSent(true)
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally { setLoading(false) }
  }

  async function verifyOTP(data: OTPForm) {
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/otp/verify/', {
        email, otp: data.otp, purpose: 'onboard',
      })
      if (res.data.verified) {
        setOtpVerified(true)
        setStep('password')
      }
    } catch {
      setError('Invalid or expired OTP. Please try again.')
    } finally { setLoading(false) }
  }

  async function setPassword(data: OnboardForm) {
    setError(''); setLoading(true)
    try {
      await api.post('/auth/onboard/', {
        email,
        password: data.password,
        confirm_password: data.confirmPassword,
      })
      onSuccess()
    } catch {
      setError('Failed to set password. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 mb-3">
          <ShieldCheck className="w-6 h-6 text-green-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Complete Your Setup</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Verify your email and set a password to activate your account.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex-1 h-1 rounded-full ${otpVerified || step === 'password' ? 'bg-green-500' : 'bg-blue-500'}`} />
        <div className={`flex-1 h-1 rounded-full ${step === 'password' ? 'bg-blue-500' : 'bg-zinc-700'}`} />
      </div>
      <div className="flex justify-between text-xs text-zinc-500 mb-4">
        <span className={step === 'otp' ? 'text-blue-400' : otpVerified ? 'text-green-400' : ''}>
          1. Verify Email
        </span>
        <span className={step === 'password' ? 'text-blue-400' : ''}>
          2. Set Password
        </span>
      </div>

      {/* OTP Step */}
      {step === 'otp' && (
        <>
          {!otpSent ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                We&apos;ll send a verification code to <strong className="text-blue-300">{email}</strong>
              </div>
              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send Verification Code
              </button>
            </div>
          ) : (
            <form onSubmit={handleOtp(verifyOTP)} className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                Code sent! Check your email (valid for 5 minutes).
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Enter Code</label>
                <input
                  {...regOtp('otp')}
                  type="text" maxLength={6}
                  placeholder="000000"
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 tracking-[0.5em] text-center font-mono"
                />
                {otpErrors.otp && <p className="text-xs text-red-400 mt-1">{otpErrors.otp.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Verify Code
              </button>
              <button
                type="button"
                onClick={sendOTP}
                className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-1"
              >
                Resend code
              </button>
            </form>
          )}
        </>
      )}

      {/* Password Step */}
      {step === 'password' && (
        <form onSubmit={handlePass(setPassword)} className="space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
            Email verified! Now set your password.
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                {...regPass('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passErrors.password && <p className="text-xs text-red-400 mt-1">{passErrors.password.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                {...regPass('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60"
              />
            </div>
            {passErrors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{passErrors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Activate Account
          </button>
        </form>
      )}

      <button
        onClick={onBack}
        className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-2 mt-2 transition-colors"
      >
        ← Back
      </button>
    </div>
  )
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage() {

  const [step, setStep]               = useState<Step>('email')
  const [email, setEmail]             = useState('')
  const [loginCheck, setLoginCheck]   = useState<LoginCheckResponse | null>(null)
  const [apiMemberships, setApiMemberships] = useState<SchoolMembership[]>([])
  const [tab, setTab]                 = useState<'password' | 'otp'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent]         = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  const { register: regEmail, handleSubmit: handleEmail } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  })
  const { register: regPass, handleSubmit: handlePass, formState: { errors: passErrors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })
  const { register: regOtp, handleSubmit: handleOtp, formState: { errors: otpErrors } } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  })

  async function onEmailSubmit(data: EmailForm) {
    setError(''); setLoading(true)
    try {
      const normEmail = normalizeEmail(data.email)
      const res = await api.post('/auth/login-check/', { email: normEmail })
      const check: LoginCheckResponse = res.data
      setEmail(normEmail)
      setLoginCheck(check)

      if (check.needs_onboard) {
        setStep('onboard')
      } else {
        setStep('login')
      }
    } catch {
      setError('Failed to continue. Please check your email.')
    } finally { setLoading(false) }
  }

  async function onPasswordSubmit(data: PasswordForm) {
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/login/', {
        email: email,
        password: data.password,
      })
      const memberships: SchoolMembership[] = res.data?.memberships || []
      if (memberships.length > 1) {
        setApiMemberships(memberships)
        setStep('school-select')
      } else {
        const accessToken = res.data?.access
        if (accessToken) {
          window.location.href = getDashboardPath(decodeToken(accessToken))
        } else {
          window.location.href = '/login'
        }
      }
    } catch {
      setError('Invalid email or password.')
    } finally { setLoading(false) }
  }

  async function onOtpSendSubmit() {
    setError(''); setLoading(true)
    try {
      await api.post('/auth/otp/send/', { email, purpose: 'login' })
      setOtpSent(true)
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally { setLoading(false) }
  }

  async function onOtpVerifySubmit(data: OTPForm) {
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/otp/verify/', {
        email, otp: data.otp, purpose: 'login',
      })
      const memberships: SchoolMembership[] = res.data?.memberships || []
      if (memberships.length > 1) {
        setApiMemberships(memberships)
        setStep('school-select')
      } else {
        const accessToken = res.data?.access
        if (accessToken) {
          window.location.href = getDashboardPath(decodeToken(accessToken))
        } else {
          window.location.href = '/login'
        }
      }
    } catch {
      setError('Invalid or expired OTP. Please try again.')
    } finally { setLoading(false) }
  }

  async function onSchoolSelect(membership: SchoolMembership) {
    setLoading(true); setError('')
    try {
      await api.post('/auth/select-school/', { membership_id: membership.id })
      window.location.href = getDashboardPathFromMembership(membership)
    } catch (err: unknown) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to switch school.')
    }
  }

  function goBack() {
    setStep('email'); setLoginCheck(null); setApiMemberships([]); setOtpSent(false); setError('')
  }

  const inputClass = "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 transition-all"

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg shadow-blue-500/25">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 9l10 6 10-6-10-6z" fill="white" opacity="0.9"/>
              <path d="M2 15l10 6 10-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            School Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {step === 'email' && 'Sign in to your account'}
            {step === 'login' && `Welcome back`}
            {step === 'onboard' && 'Complete your account setup'}
            {step === 'school-select' && 'Choose your school'}
          </p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Back button for non-email steps */}
          {step !== 'email' && (
            <div className="px-6 pt-4">
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          <div className="p-6">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* ── Step 1: Email ── */}
            {step === 'email' && (
              <form onSubmit={handleEmail(onEmailSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      {...regEmail('email')}
                      type="email"
                      placeholder="you@school.com"
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* ── Step 2a: School Select ── */}
            {step === 'school-select' && (
              <SchoolSelectScreen
                memberships={apiMemberships}
                onSelect={onSchoolSelect}
                onBack={goBack}
                loading={loading}
              />
            )}

            {/* ── Step 2b: Onboard ── */}
            {step === 'onboard' && (
              <OnboardScreen
                email={email}
                onSuccess={() => window.location.href = '/login'}
                onBack={goBack}
              />
            )}

            {/* ── Step 2c: Password/OTP Login ── */}
            {step === 'login' && (
              <>
                <div className="mb-4 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                  Signing in as <span className="font-medium text-blue-300">{email}</span>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800 mb-4">
                  <button
                    onClick={() => { setTab('password'); setError('') }}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'password' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500'}`}
                  >
                    Password
                  </button>
                  <button
                    onClick={() => { setTab('otp'); setError(''); setOtpSent(false) }}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'otp' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500'}`}
                  >
                    OTP
                  </button>
                </div>

                {/* Password Tab */}
                {tab === 'password' && (
                  <form onSubmit={handlePass(onPasswordSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          {...regPass('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passErrors.password && <p className="text-xs text-red-400 mt-1">{passErrors.password.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Sign In <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* OTP Tab */}
                {tab === 'otp' && !otpSent && (
                  <div className="space-y-4">
                    <button
                      onClick={onOtpSendSubmit}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Send OTP to Email
                    </button>
                  </div>
                )}

                {tab === 'otp' && otpSent && (
                  <form onSubmit={handleOtp(onOtpVerifySubmit)} className="space-y-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                      OTP sent to <strong className="text-green-300">{email}</strong>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Enter OTP</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          {...regOtp('otp')}
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 tracking-[0.5em] text-center font-mono"
                        />
                      </div>
                      {otpErrors.otp && <p className="text-xs text-red-400 mt-1">{otpErrors.otp.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Verify & Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-1"
                    >
                      Use different method
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          School Management System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

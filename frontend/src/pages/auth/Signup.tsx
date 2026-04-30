import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { signup } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const nav = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await signup({ name, email, password })
      setAuth(data.accessToken, data.user)
      nav('/dashboard')
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.10),_transparent_26%)]" />
      <div className="relative min-h-screen grid lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden lg:flex flex-col justify-between p-10 xl:p-16 border-r border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),transparent)] order-2 lg:order-1">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/80 text-xs text-text-secondary">
              <Sparkles size={14} className="text-violet-400" /> Set up your workspace
            </div>
            <h1 className="mt-8 text-5xl xl:text-6xl font-semibold tracking-tight max-w-xl leading-[1.02]">
              Build a calm place for your team’s work.
            </h1>
            <p className="mt-6 max-w-lg text-base xl:text-lg text-text-secondary leading-7">
              Create your account once and get a polished task board, dashboard, and project hub ready to use.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xl">
            {[
              'Fast signup with automatic login',
              'Role-based project access',
              'Mobile-friendly layouts',
              'Dark minimal interface'
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-surface/70 p-4 text-sm text-text-secondary">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-6 lg:p-10 order-1 lg:order-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
            <Card>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-text-secondary mb-4">
                  <ShieldCheck size={14} className="text-emerald-400" /> Create your account
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">Start your workspace</h2>
                <p className="mt-2 text-sm text-text-secondary leading-6">
                  Add your details below and you’ll be taken straight into the app.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Alex Morgan" />
                <Input label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="name@company.com" />
                <label className="block">
                  <div className="text-sm text-text-secondary mb-1 font-medium">Password</div>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e)=>setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Choose a secure password"
                      className="w-full px-3 py-3 pr-12 rounded-xl bg-surface border border-border text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-3 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between pt-2">
                  <Button type="submit" loading={loading} size="lg" className="w-full">
                    Sign up
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary pt-2">
                  <span>Already have an account?</span>
                  <Link to="/auth/login" className="text-primary hover:text-primaryHover transition-colors font-medium">
                    Sign in
                  </Link>
                </div>
              </form>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  )
}

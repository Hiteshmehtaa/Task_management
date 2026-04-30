import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const nav = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login({ email, password })
      setAuth(data.accessToken, data.user)
      nav('/dashboard')
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_28%)]" />
      <div className="relative min-h-screen grid lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:flex flex-col justify-between p-10 xl:p-16 border-r border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),transparent)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/80 text-xs text-text-secondary">
              <Sparkles size={14} className="text-primary" /> Minimal team workflow
            </div>
            <h1 className="mt-8 text-5xl xl:text-6xl font-semibold tracking-tight max-w-xl leading-[1.02]">
              Clean task management for focused teams.
            </h1>
            <p className="mt-6 max-w-lg text-base xl:text-lg text-text-secondary leading-7">
              Sign in to view projects, move tasks across the board, and keep work organized without visual noise.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xl">
            {[
              'Project boards with drag and drop',
              'Private auth with refresh cookies',
              'Fast dashboard with live stats',
              'Minimal UI that scales cleanly'
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-surface/70 p-4 text-sm text-text-secondary">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-6 lg:p-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
            <Card>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-text-secondary mb-4">
                  <ShieldCheck size={14} className="text-emerald-400" /> Secure access
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
                <p className="mt-2 text-sm text-text-secondary leading-6">
                  Enter your email and password to continue to your workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="name@company.com" />
                <div>
                  <label className="block">
                    <div className="text-sm text-text-secondary mb-1 font-medium">Password</div>
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        type={show ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full px-3 py-3 pr-12 rounded-xl bg-surface border border-border text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary/50"
                      />
                      <button
                        type="button"
                        onClick={()=>setShow(s=>!s)}
                        className="absolute inset-y-0 right-3 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                        aria-label={show ? 'Hide password' : 'Show password'}
                      >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button type="submit" loading={loading} size="lg" className="w-full">
                    Sign in
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary pt-2">
                  <span>New here?</span>
                  <Link to="/auth/signup" className="text-primary hover:text-primaryHover transition-colors font-medium">
                    Create account
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

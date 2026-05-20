import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Heart,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '#/env'
import { meQuery } from '#/lib/queries/user'
import { teamsQuery } from '#/lib/queries/team'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

// Base configurations using your dynamic URL setup
const API_URL = env.VITE_SERVER_URL

export const Route = createFileRoute('/')({ component: AuthHome })

function AuthHome() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  // 1. TanStack Query Mutation handling Sanctum Auth State
  const authMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      // Laravel Sanctum requires hitting the CSRF initialization route first
      await axios.get(`${API_URL}/sanctum/csrf-cookie`)

      if (activeTab === 'login') {
        return axios.post(`${API_URL}/api/auth/login`, {
          email: values.email,
          password: values.password,
        })
      } else {
        return axios.post(`${API_URL}/api/auth/register`, {
          name: values.name,
          email: values.email,
          password: values.password,
          password_confirmation: values.confirmPassword,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meQuery().queryKey })
      queryClient.invalidateQueries({ queryKey: teamsQuery().queryKey })

      // Automatically route inside your TanStack Router tree on successful auth
      setTimeout(() => {
        navigate({ to: '/dashboard' })
      }, 1000)
    },
  })

  // 2. TanStack Form Management
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onChange: ({ value }) => {
        if (!value.email) return { email: 'Email is required' }
        if (!value.password || value.password.length < 6) {
          return { password: 'Password must be at least 6 characters' }
        }
        if (activeTab === 'register') {
          if (!value.name) return { name: 'Name is required' }
          if (value.password !== value.confirmPassword) {
            return { confirmPassword: 'Passwords must match' }
          }
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      authMutation.mutate(value)
    },
  })

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    authMutation.reset()
    form.reset()
  }

  // Safely extract validation error strings across platforms
  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (
        error.response?.data?.message ||
        'Authentication failed. Please check your network or entries.'
      )
    }
    return 'An unexpected error occurred.'
  }

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4 font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Container Card */}
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Decorative Top Line using standard UI design tokens */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-1">
            <Heart className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Trévi</h1>
          <p className="text-sm text-muted-foreground">
            A collaborative restaurant diary for you and your partner.
          </p>
        </div>

        {/* ShadCN-style Tabs Switcher */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-lg text-sm font-medium">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`py-1.5 text-center rounded-md transition-all ${
              activeTab === 'login'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`py-1.5 text-center rounded-md transition-all ${
              activeTab === 'register'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Mutation Alerts / Backend Feedback */}
        {authMutation.isError && (
          <div className="p-3.5 rounded-lg flex items-start gap-3 text-sm border bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-tight">
              {getErrorMessage(authMutation.error)}
            </p>
          </div>
        )}

        {authMutation.isSuccess && (
          <div className="p-3.5 rounded-lg flex items-start gap-3 text-sm border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-tight">
              {activeTab === 'login'
                ? 'Welcome back! Syncing your shared culinary diary...'
                : 'Registration successful! Welcome to Trévi.'}
            </p>
          </div>
        )}

        {/* Form Element powered by TanStack Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Name Field (Register Mode Only) */}
          {activeTab === 'register' && (
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label
                    htmlFor={field.name}
                    className="text-xs font-semibold text-muted-foreground tracking-wide uppercase"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      placeholder="e.g. Alex Smith"
                      disabled={authMutation.isPending}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>
              )}
            />
          )}

          {/* Email Address */}
          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-1.5">
                <label
                  htmlFor={field.name}
                  className="text-xs font-semibold text-muted-foreground tracking-wide uppercase"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    disabled={authMutation.isPending}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
            )}
          />

          {/* Password */}
          <form.Field
            name="password"
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={field.name}
                    className="text-xs font-semibold text-muted-foreground tracking-wide uppercase"
                  >
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <a
                      href="#"
                      className="text-xs text-primary hover:underline transition-all font-medium"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    disabled={authMutation.isPending}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
            )}
          />

          {/* Confirm Password (Register Mode Only) */}
          {activeTab === 'register' && (
            <form.Field
              name="confirmPassword"
              children={(field) => (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label
                    htmlFor={field.name}
                    className="text-xs font-semibold text-muted-foreground tracking-wide uppercase"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      disabled={authMutation.isPending}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>
              )}
            />
          )}

          {/* Inline Validation Summary Indicator */}
          <form.Subscribe
            selector={(state) => state.fieldMeta}
            children={(fieldMeta) => {
              // Safely look through the field metadata object values
              const hasClientErrors = Object.values(fieldMeta).some(
                (field) => field.errors.length > 0,
              )

              if (!hasClientErrors) return null

              return (
                <p className="text-xs text-destructive text-center font-medium animate-pulse">
                  Please review your details before submitting.
                </p>
              )
            }}
          />
          {/* Submit Button */}
          <button
            type="submit"
            disabled={authMutation.isPending}
            className="w-full py-2.5 px-4 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {authMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {activeTab === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'}
              </>
            ) : (
              <>
                {activeTab === 'login' ? 'Sign In' : 'Get Started'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom micro-copy helper */}
        <p className="text-xs text-center text-muted-foreground px-6">
          By continuing, you agree to our shared culinary terms and privacy
          guidelines.
        </p>
      </div>

      {/* Mini footer details */}
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 fill-primary text-primary" />{' '}
          for romantic foodies.
        </p>
      </footer>
    </div>
  )
}

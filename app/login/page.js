'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Check for URL parameters on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlMessage = urlParams.get('message')
    const messageType = urlParams.get('type')
    
    if (urlMessage) {
      if (messageType === 'success') {
        setMessage(urlMessage)
        setError('')
      } else if (messageType === 'error') {
        setError(urlMessage)
        setMessage('')
      } else {
        setMessage(urlMessage)
        setError('')
      }
      
      // Clear URL parameters without refreshing
      window.history.replaceState({}, document.title, '/login')
    }
  }, [])

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage('✅ Confirmation email sent! Check your inbox and spam folder.')
      } else {
        setError(data.error || 'Failed to send confirmation email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setError('Failed to send confirmation email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        // Sign up with email and password
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            emailRedirectTo: `https://siterecap.com/auth/callback`
          }
        })

        if (error) throw error

        if (data.user) {
          if (!data.user.email_confirmed_at) {
            setMessage('Almost there! Check your email and click the confirmation link to complete signup.')
          } else {
            setMessage('Account created successfully! Redirecting...')
            setTimeout(() => router.push('/dashboard'), 2000)
          }
        }
      } else {
        // Try sign in with email and password first
        if (password) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          })

          if (error) {
            // If password sign in fails, fall back to magic link
            const { error: magicError } = await supabase.auth.signInWithOtp({
              email: email.trim(),
              options: {
                emailRedirectTo: `https://siterecap.com/auth/callback`
              }
            })

            if (magicError) throw magicError
            
            setMessage('Check your email for a secure sign-in link!')
          } else {
            setMessage('Signed in successfully! Redirecting...')
            setTimeout(() => router.push('/dashboard'), 1000)
          }
        } else {
          // Magic link sign in
          const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
              emailRedirectTo: `https://siterecap.com/auth/callback`
            }
          })

          if (error) throw error
          
          setMessage('Check your email for a secure sign-in link!')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏗️</div>
          <h1 className="text-3xl font-bold text-brand-text">SiteRecap</h1>
          <p className="text-muted-foreground mt-2">
            Transform job site photos into professional reports
          </p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              {isSignUp 
                ? 'Create your account to get started' 
                : 'Access your construction reports'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              {(isSignUp || password) && (
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {!isSignUp && '(optional - leave blank for email link)'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={isSignUp ? "Create secure password" : "Your password (optional)"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      disabled={loading}
                      minLength={isSignUp ? 6 : 0}
                    />
                  </div>
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>
              )}

              {/* Messages */}
              {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">{message}</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  'Processing...'
                ) : isSignUp ? (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center space-y-4">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Create one"
                }
              </button>

              {!isSignUp && (
                <div className="text-xs text-muted-foreground">
                  <p>💡 No password? We'll send a secure link to your email</p>
                </div>
              )}

              {/* Resend Confirmation */}
              <div className="pt-2">
                <button
                  onClick={handleResendConfirmation}
                  className="text-xs text-muted-foreground hover:text-primary"
                  disabled={loading}
                >
                  Need a new confirmation email? Click here
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "@/lib/validations/schemas"

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  
  const { register: authRegister } = useAuth()
  const router = useRouter()
  const [chartHeights, setChartHeights] = useState<number[]>([])
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })
  
  const password = watch("password", "")
  
  // Generate chart heights only on client side to avoid hydration mismatch
  useEffect(() => {
    setChartHeights(Array.from({ length: 12 }, () => 25 + Math.random() * 75))
  }, [])

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return strength
  }

  const strength = getPasswordStrength(password)
  const strengthColor =
    strength === 0 ? "bg-gray-600" : strength <= 1 ? "bg-red-600" : strength <= 2 ? "bg-yellow-500" : "bg-green-500"
  const strengthText =
    strength === 0 ? "" : strength <= 1 ? "Weak" : strength <= 2 ? "Medium" : strength <= 3 ? "Strong" : "Very strong"

  const onSubmit = async (data: RegisterFormData) => {
    setError("")

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      return
    }

    try {
      await authRegister({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      // Redirect to dashboard on success
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="font-semibold text-lg">UptimeMonitor</span>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 min-h-[calc(100vh-73px)]">
        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-center px-12 bg-gradient-to-br from-background via-background to-blue-950/30 border-r border-border/50">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Keep your services <span className="text-blue-500">Online & Healthy</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Join thousands of developers who trust UptimeMonitor for real-time alerts, detailed analytics, and instant
            incident reporting.
          </p>

          {/* System Status */}
          <div className="bg-card border border-border/50 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">System Status</h3>
              <span className="text-green-500 text-sm font-semibold">99.99% Uptime</span>
            </div>
            <div className="h-24 flex items-end gap-1.5">
                {chartHeights.length > 0 ? (
                  chartHeights.map((height, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"
                        style={{ height: `${height}%` }}
                    ></div>
                  ))
                ) : (
                  // Placeholder saat server-side render
                  Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm opacity-50"
                        style={{ height: '50%' }}
                    ></div>
                  ))
                )}
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background flex items-center justify-center text-white text-sm font-semibold"
                >
                  +{i}k
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Monitoring over 50,000 endpoints.</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-bold mb-3">Create your account</h2>
            <p className="text-muted-foreground mb-8">Start your 14-day free trial. No credit card required.</p>

            {/* Social Auth */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button variant="outline" className="h-12 gap-2 bg-transparent">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-12 gap-2 bg-transparent">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or register with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="e.g Jane Doe" 
                  className={`h-11 bg-card border-border/50 ${errors.name ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="email"
                    placeholder="jane@company.com" 
                    className={`h-11 pl-10 bg-card border-border/50 ${errors.email ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-11 pr-10 bg-card border-border/50 ${errors.password ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Password strength</span>
                      <span className="text-xs text-muted-foreground">{strengthText}</span>
                    </div>
                    <div className="h-1 bg-background rounded-full overflow-hidden">
                      <div
                        className={`${strengthColor} h-full transition-all`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">Must be at least 8 characters.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className={`h-11 pr-10 bg-card border-border/50 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mt-1"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isSubmitting}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="#" className="text-blue-500 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue-500 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-500 hover:underline font-semibold">
                  Log In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react"

export function SignupForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"admin" | "mr" | "warehouse">("mr")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Insert profile data
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: role,
        })

        if (profileError) {
          setError("Failed to create user profile")
        } else {
          setSuccess("Account created successfully! Please check your email for verification.")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (roleValue: string) => {
    switch (roleValue) {
      case "admin":
        return "👑"
      case "mr":
        return "🩺"
      case "warehouse":
        return "📦"
      default:
        return "👤"
    }
  }

  return (
    <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">Create Account</CardTitle>
        <CardDescription className="text-center text-gray-600">
          Join MedStock Pro to start managing your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="rounded-xl border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="pl-10 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="pl-10 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
                className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 h-12"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
              Role
            </Label>
            <Select value={role} onValueChange={(value: "admin" | "mr" | "warehouse") => setRole(value)}>
              <SelectTrigger className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 h-12">
                <div className="flex items-center gap-2">
                  <span>{getRoleIcon(role)}</span>
                  <SelectValue placeholder="Select your role" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="admin" className="rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>👑</span>
                    <div>
                      <p className="font-medium">Administrator</p>
                      <p className="text-xs text-gray-500">Full system access</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="mr" className="rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>🩺</span>
                    <div>
                      <p className="font-medium">Medical Representative</p>
                      <p className="text-xs text-gray-500">Field sales and stock management</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="warehouse" className="rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>📦</span>
                    <div>
                      <p className="font-medium">Warehouse Staff</p>
                      <p className="text-xs text-gray-500">Inventory and stock operations</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">
              Privacy Policy
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

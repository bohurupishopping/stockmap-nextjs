"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Stethoscope, Shield, BarChart3, Users } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">MedStock Pro</h1>
              <p className="text-blue-100">Medical Inventory Management</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">Streamline Your Medical Inventory Management</h2>

          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Comprehensive solution for tracking medical products, managing batches, monitoring expiry dates, and
            optimizing your healthcare supply chain.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-blue-100">Secure & Compliant</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-blue-100">Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-blue-100">Multi-user Support</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-20 right-32 h-24 w-24 rounded-full bg-purple-300/20 blur-xl"></div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MedStock Pro
              </span>
            </div>
            <p className="text-gray-600">Medical Inventory Management System</p>
          </div>

          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your medical inventory dashboard</p>
          </div>

          <LoginForm />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Create one here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

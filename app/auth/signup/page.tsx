"use client"

import { SignupForm } from "@/components/auth/signup-form"
import { Stethoscope, CheckCircle, Clock, Shield } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-blue-700 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">MedStock Pro</h1>
              <p className="text-emerald-100">Join Our Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">Start Managing Your Medical Inventory Today</h2>

          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Join thousands of healthcare professionals who trust MedStock Pro for their inventory management needs.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-300" />
              <span className="text-emerald-100">Free 30-day trial</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-emerald-300" />
              <span className="text-emerald-100">Setup in under 5 minutes</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-300" />
              <span className="text-emerald-100">HIPAA compliant & secure</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-20 right-32 h-24 w-24 rounded-full bg-emerald-300/20 blur-xl"></div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                MedStock Pro
              </span>
            </div>
            <p className="text-gray-600">Create Your Account</p>
          </div>

          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join MedStock Pro and revolutionize your inventory management</p>
          </div>

          <SignupForm />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

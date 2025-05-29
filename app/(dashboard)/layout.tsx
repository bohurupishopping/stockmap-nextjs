"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        setUser(user)
        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/auth/login")
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const getPageTitle = (path: string) => {
    const pathMap: { [key: string]: string } = {
      "/dashboard": "Dashboard",
      "/products": "Product & Batch Master",
      "/stock-in": "Stock In",
      "/stock-transfer": "Stock Transfer",
      "/godown-sales": "Godown Sales",
      "/mr-sales": "MR Sales",
      "/mr-stock": "MR Stock View",
      "/stock-returns": "Stock Returns",
      "/stock-adjustments": "Stock Adjustments",
      "/mr-management": "MR Management",
      "/inventory-reports": "Inventory Reports",
      "/sales-reports": "Sales Reports",
      "/alerts": "Alerts & Notifications",
      "/user-management": "User Management",
    }
    return pathMap[path] || "Dashboard"
  }

  // Only redirect if user is not authenticated
  if (!user && !loading) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-br from-gray-50 to-white">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm px-4 shadow-sm">
          <SidebarTrigger className="-ml-1 rounded-lg hover:bg-gray-100 transition-colors" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
                  MedStock Pro
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-gray-900">{getPageTitle(pathname)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="animate-slide-in">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

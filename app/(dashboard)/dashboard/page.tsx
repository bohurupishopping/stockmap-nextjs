"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  AlertTriangle,
  Users,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Eye,
  ArrowUpRight,
  BarChart3,
} from "lucide-react"

interface DashboardStats {
  totalProducts: number
  totalBatches: number
  lowStockAlerts: number
  expiringBatches: number
  totalSales: number
  activeMRs: number
  todaySales: number
  monthlyRevenue: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBatches: 0,
    lowStockAlerts: 0,
    expiringBatches: 0,
    totalSales: 0,
    activeMRs: 0,
    todaySales: 0,
    monthlyRevenue: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products count
        const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

        // Fetch batches count
        const { count: batchesCount } = await supabase.from("batches").select("*", { count: "exact", head: true })

        // Fetch low stock alerts (batches with remaining_quantity < 10)
        const { count: lowStockCount } = await supabase
          .from("batches")
          .select("*", { count: "exact", head: true })
          .lt("remaining_quantity", 10)

        // Fetch expiring batches (expiring in next 30 days)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const { count: expiringCount } = await supabase
          .from("batches")
          .select("*", { count: "exact", head: true })
          .lt("expiry_date", thirtyDaysFromNow.toISOString())

        // Fetch active MRs
        const { count: mrsCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "mr")

        // Fetch recent transactions
        const { data: transactions } = await supabase
          .from("stock_transactions")
          .select(`
            *,
            products(name),
            batches(batch_number),
            profiles(full_name)
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        setStats({
          totalProducts: productsCount || 0,
          totalBatches: batchesCount || 0,
          lowStockAlerts: lowStockCount || 0,
          expiringBatches: expiringCount || 0,
          totalSales: 0,
          activeMRs: mrsCount || 0,
          todaySales: 0,
          monthlyRevenue: 0,
        })

        setRecentTransactions(transactions || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "stock_in":
        return <Package className="h-4 w-4" />
      case "godown_sale":
      case "mr_sale":
        return <ShoppingCart className="h-4 w-4" />
      case "stock_transfer":
        return <ArrowUpRight className="h-4 w-4" />
      case "return":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "stock_in":
        return "text-green-600 bg-green-50 border-green-200"
      case "godown_sale":
      case "mr_sale":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "stock_transfer":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "return":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to MedStock Pro
        </h1>
        <p className="text-lg text-gray-600">Your comprehensive medical inventory management dashboard</p>
      </div>

      {/* Alerts Section */}
      {(stats.lowStockAlerts > 0 || stats.expiringBatches > 0) && (
        <div className="space-y-3">
          {stats.lowStockAlerts > 0 && (
            <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                <span className="font-bold">{stats.lowStockAlerts}</span> product batches are running low on stock and
                require immediate attention
              </AlertDescription>
            </Alert>
          )}
          {stats.expiringBatches > 0 && (
            <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl">
              <Clock className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800 font-medium">
                <span className="font-bold">{stats.expiringBatches}</span> product batches are expiring within 30 days
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Products</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Active in catalog
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Available Batches</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBatches}</div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Inventory batches
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Stock Alerts</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.lowStockAlerts}</div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-4 w-4 text-red-600" />
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Active MRs</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeMRs}</div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Users className="h-4 w-4 text-purple-600" />
              Medical reps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 medical-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
                <CardDescription className="text-gray-600">Latest stock movements and activities</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No recent transactions</p>
                  <p className="text-sm text-gray-400">Transactions will appear here as they occur</p>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {transaction.products?.name || "Unknown Product"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Batch: {transaction.batches?.batch_number || "N/A"} • Qty: {transaction.quantity}
                      </p>
                      <p className="text-xs text-gray-500">By: {transaction.profiles?.full_name || "Unknown User"}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getTransactionColor(transaction.type)} font-medium`}>
                        {transaction.type.replace("_", " ").toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600">Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Package className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl border-green-200 text-green-700 hover:bg-green-50"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Record Stock In
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Process Sale
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stock Health Overview */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Stock Health Overview</CardTitle>
          <CardDescription className="text-gray-600">Monitor your inventory status at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Healthy Stock</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
              <Progress value={85} className="h-2 bg-gray-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Low Stock</span>
                <span className="font-medium text-orange-600">10%</span>
              </div>
              <Progress value={10} className="h-2 bg-gray-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Out of Stock</span>
                <span className="font-medium text-red-600">5%</span>
              </div>
              <Progress value={5} className="h-2 bg-gray-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, SortingState, ColumnFiltersState } from "@tanstack/react-table"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Types
type Product = {
  id: string
  name: string
  description: string
  category: string
  unit: string
  price: number
  sku: string
  manufacturer: string
  is_active: boolean
  created_at: string
}

// API Functions
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data || []
}

const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Queries
  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  // Mutations
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  // Table setup
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('category') || 'Uncategorized'}
        </Badge>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('price'))
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)

        return <div>{formatted}</div>
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
          {row.getValue('is_active') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => deleteProductMutation.mutate(product.id)}
              disabled={deleteProductMutation.isPending}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-full mb-2" />
      </div>
    )
  }


  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <p>Error loading products: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Products</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your inventory products
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8 w-[200px] lg:w-[300px]"
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(event.target.value)}
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

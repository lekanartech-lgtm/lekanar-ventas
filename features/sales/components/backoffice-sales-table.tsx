'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Search, MoreHorizontal, Eye, Pencil, MapPin } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RequestStatusBadge, OrderStatusBadge } from './sale-status-badge'
import type { Sale } from '../types'

type BackofficeSale = Sale & { userName?: string }

const columns: ColumnDef<BackofficeSale>[] = [
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Cliente
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const sale = row.original
      return (
        <div>
          <div className="font-medium">{sale.fullName}</div>
          <div className="text-sm text-muted-foreground">
            DNI: {sale.dni}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'userName',
    header: 'Asesor',
    cell: ({ row }) => {
      const userName = row.getValue('userName') as string | undefined
      return userName || '-'
    },
  },
  {
    accessorKey: 'operatorName',
    header: 'Operador',
    cell: ({ row }) => {
      const operatorName = row.getValue('operatorName') as string | undefined
      return operatorName || '-'
    },
  },
  {
    accessorKey: 'planName',
    header: 'Plan',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.planName}</div>
        <div className="text-sm text-muted-foreground">
          S/.{row.original.price.toFixed(2)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const score = row.getValue('score') as number | null
      return score !== null ? (
        <span className="font-medium">{score}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'requestStatus',
    header: 'Pedido',
    cell: ({ row }) => <RequestStatusBadge status={row.getValue('requestStatus')} />,
  },
  {
    accessorKey: 'orderStatus',
    header: 'Orden',
    cell: ({ row }) => <OrderStatusBadge status={row.getValue('orderStatus')} />,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <span className="text-muted-foreground">
          {new Date(date).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
          })}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const sale = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/backoffice/sales/${sale.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar / Ver
              </Link>
            </DropdownMenuItem>
            {sale.latitude && sale.longitude && (
              <DropdownMenuItem asChild>
                <a
                  href={`https://maps.google.com/?q=${sale.latitude},${sale.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver en mapa
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function BackofficeSalesTable({ sales }: { sales: BackofficeSale[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data: sales,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize: 20 },
    },
  })

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI o asesor..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay ventas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} ventas
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

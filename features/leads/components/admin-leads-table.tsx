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
import { ArrowUpDown, Search, Phone, Pencil } from 'lucide-react'
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
import { LeadStatusBadge } from './lead-status-badge'
import type { Lead } from '../types'

type AdminLead = Lead & { userName?: string }

const columns: ColumnDef<AdminLead>[] = [
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
      const lead = row.original
      return (
        <div>
          <div className="font-medium">{lead.fullName}</div>
          {lead.dni && (
            <div className="text-sm text-muted-foreground">DNI: {lead.dni}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Asesor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const userName = row.getValue('userName') as string | undefined
      return userName || <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'phone',
    header: 'Teléfono',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string
      return (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <Phone className="h-3 w-3" />
          {phone}
        </a>
      )
    },
  },
  {
    accessorKey: 'operatorName',
    header: 'Operador',
    cell: ({ row }) => {
      const operatorName = row.getValue('operatorName') as string | undefined
      return operatorName || <span className="text-muted-foreground">-</span>
    },
  },
  {
    id: 'location',
    header: 'Ubicación',
    cell: ({ row }) => {
      const lead = row.original
      const parts = [lead.districtName, lead.cityName].filter(Boolean)

      if (parts.length === 0) {
        return <span className="text-muted-foreground">-</span>
      }

      return (
        <div>
          <div className="font-medium">{parts[0]}</div>
          {parts[1] && (
            <div className="text-sm text-muted-foreground">{parts[1]}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <LeadStatusBadge status={row.getValue('status')} />,
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
            year: 'numeric',
          })}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const lead = row.original
      return (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/leads/${lead.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      )
    },
  },
]

export function AdminLeadsTable({ leads }: { leads: AdminLead[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data: leads,
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
        <div className="relative w-full max-w-sm">
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
                    No hay leads registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()} ({table.getFilteredRowModel().rows.length} leads)
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

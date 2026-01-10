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
import { ArrowUpDown, Search, Phone, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { LeadStatusBadge } from './lead-status-badge'
import { OPERATORS } from '../constants'
import type { Lead } from '../types'

function getOperatorLabel(value: string | null): string {
  if (!value) return '-'
  const op = OPERATORS.find((o) => o.value === value)
  return op?.label || value
}

const columns: ColumnDef<Lead>[] = [
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
          <div className="text-sm text-muted-foreground">DNI: {lead.dni}</div>
        </div>
      )
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
    accessorKey: 'currentOperator',
    header: 'Operador',
    cell: ({ row }) => getOperatorLabel(row.getValue('currentOperator')),
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/leads/${lead.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function LeadsTable({ leads }: { leads: Lead[] }) {
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
      pagination: { pageSize: 10 },
    },
  })

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o DNI..."
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
              {table.getFilteredRowModel().rows.length} leads
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

// Mobile-friendly card list for small screens
export function LeadsCardList({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay leads registrados
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">{lead.fullName}</p>
                <p className="text-sm text-muted-foreground">DNI: {lead.dni}</p>
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1 text-sm text-primary"
                >
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </a>
              </div>
              <div className="flex flex-col items-end gap-2">
                <LeadStatusBadge status={lead.status} />
                <span className="text-xs text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/leads/${lead.id}/edit`}>
                  <Pencil className="mr-2 h-3 w-3" />
                  Editar
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${lead.phone}`}>
                  <Phone className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

import { type Meta } from '@storybook/react-webpack5'
import { type ColumnFiltersState, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { TableFilter } from './table-filter'

function FilterStory({ multiple = true, disabled = false }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const table = useReactTable({
    data: [],
    columns: [
      {
        accessorKey: 'project',
        header: 'Project',
        meta: {
          facetedValues: new Map([
            ['Frontend', 1],
            ['Backend', 1],
          ]),
        },
      },
    ],
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
  })
  const column = table.getColumn('project')
  if (!column) return null
  return <TableFilter column={column} multiple={multiple} disabled={disabled} />
}
const story: Meta = { title: 'TableFilter', component: FilterStory }
export default story
export const Multiple = { args: { multiple: true } }
export const Single = { args: { multiple: false } }
export const Disabled = { args: { disabled: true } }

import { type ColumnFiltersState, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { TableFilter } from './table-filter'

function FilterExample({
  multiple = true,
  disabled = false,
  values = ['Alpha', 'Beta'],
}: {
  multiple?: boolean
  disabled?: boolean
  values?: string[]
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const table = useReactTable({
    data: [],
    columns: [
      {
        id: 'project',
        accessorKey: 'project',
        header: 'Project',
        meta: {
          facetedValues: new Map(values.map((value) => [value, 1])),
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
  return (
    <>
      <TableFilter column={column} multiple={multiple} disabled={disabled} />
      <output aria-label="Selected values">{JSON.stringify(columnFilters)}</output>
    </>
  )
}

it('keeps multiple selection as the default', async () => {
  const { userEvent } = renderWithProviders(<FilterExample />)
  await userEvent.click(screen.getByRole('button', { name: 'Project' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Alpha' }))
  await userEvent.click(screen.getByRole('button', { name: 'Alpha' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Beta' }))
  expect(screen.getByRole('status', { name: 'Selected values' })).toHaveTextContent('"value":["Alpha","Beta"]')
})

it('replaces and clears a single selection using server-provided facets on an empty table', async () => {
  const { userEvent } = renderWithProviders(<FilterExample multiple={false} />)
  await userEvent.click(screen.getByRole('button', { name: 'Project' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Alpha' }))
  await userEvent.click(screen.getByRole('button', { name: 'Alpha' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Beta' }))
  expect(screen.getByRole('status', { name: 'Selected values' })).toHaveTextContent('"value":["Beta"]')
  await userEvent.click(screen.getByRole('button', { name: 'Clear Project filter' }))
  expect(screen.getByRole('status', { name: 'Selected values' })).toHaveTextContent('[]')
})

it('can disable a dependent column filter', () => {
  renderWithProviders(<FilterExample disabled />)
  expect(screen.getByRole('button', { name: 'Project' })).toBeDisabled()
})

it('updates server-provided facets after they load', async () => {
  const { userEvent, rerender } = renderWithProviders(<FilterExample values={[]} />)
  rerender(<FilterExample values={['Loaded project']} />)
  await userEvent.click(screen.getByRole('button', { name: 'Project' }))
  expect(screen.getByRole('menuitem', { name: 'Loaded project' })).toBeInTheDocument()
})

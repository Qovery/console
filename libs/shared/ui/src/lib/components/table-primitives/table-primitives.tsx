import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

// Inspired by https://github.com/radix-ui/themes/blob/a63bd6920370d824be1db26f717147dc4a2501f1/packages/radix-ui-themes/src/components/table.tsx

interface TableRootProps extends ComponentPropsWithoutRef<'table'> {}

const TableRoot = forwardRef<ElementRef<'table'>, TableRootProps>(function TableRoot(
  { children, className, ...rest },
  ref
) {
  return (
    <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral">
      <table
        ref={ref}
        className={twMerge('min-w-full divide-y divide-neutral text-sm text-neutral', className)}
        {...rest}
      >
        {children}
      </table>
    </div>
  )
})

interface TableHeaderProps extends ComponentPropsWithoutRef<'thead'> {}

const TableHeader = forwardRef<ElementRef<'thead'>, TableHeaderProps>(function TableHeader({ children, ...rest }, ref) {
  return (
    <thead ref={ref} {...rest}>
      {children}
    </thead>
  )
})

interface TableBodyProps extends ComponentPropsWithoutRef<'tbody'> {}

const TableBody = forwardRef<ElementRef<'tbody'>, TableBodyProps>(function TableBody(
  { className, children, ...rest },
  ref
) {
  return (
    <tbody className={twMerge('divide-y divide-neutral', className)} ref={ref} {...rest}>
      {children}
    </tbody>
  )
})

interface TableRowProps extends ComponentPropsWithoutRef<'tr'> {}

const TableRow = forwardRef<ElementRef<'tr'>, TableRowProps>(function TableRow({ children, ...rest }, ref) {
  return (
    <tr ref={ref} {...rest}>
      {children}
    </tr>
  )
})

interface TableCellProps extends ComponentPropsWithoutRef<'td'> {}

const TableCell = forwardRef<ElementRef<'td'>, TableCellProps>(function TableCell(
  { children, className, ...rest },
  ref
) {
  return (
    <td ref={ref} className={twMerge('h-14 border-neutral px-4 py-0', className)} {...rest}>
      {children}
    </td>
  )
})

interface TableRowHeaderCellProps extends ComponentPropsWithoutRef<'th'> {}

const TableRowHeaderCell = forwardRef<ElementRef<'th'>, TableRowHeaderCellProps>(function TableRowHeaderCell(
  { children, className, ...rest },
  ref
) {
  return (
    <th ref={ref} className={twMerge('h-11 px-4 text-left', className)} {...rest}>
      {children}
    </th>
  )
})

interface TableColumnHeaderCellProps extends ComponentPropsWithoutRef<'th'> {}

const TableColumnHeaderCell = forwardRef<ElementRef<'th'>, TableColumnHeaderCellProps>(function TableColumnHeaderCell(
  { children, className, ...rest },
  ref
) {
  return (
    <th ref={ref} className={twMerge('h-11 border-neutral px-4 text-left font-code font-normal', className)} {...rest}>
      {children}
    </th>
  )
})

const Table = Object.assign(
  {},
  {
    Root: TableRoot,
    Header: TableHeader,
    Body: TableBody,
    Row: TableRow,
    Cell: TableCell,
    ColumnHeaderCell: TableColumnHeaderCell,
    RowHeaderCell: TableRowHeaderCell,
  }
)

export { Table, TableRoot, TableHeader, TableBody, TableRow, TableCell, TableColumnHeaderCell, TableRowHeaderCell }

export type {
  TableRootProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableColumnHeaderCellProps,
  TableRowHeaderCellProps,
}

import { type ComponentPropsWithoutRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

export interface TableFilterSearchProps extends Omit<ComponentPropsWithoutRef<'input'>, 'placeholder'> {}

export function TableFilterSearch({ className, ...props }: TableFilterSearchProps) {
  return (
    <span className="group relative">
      <Icon
        iconName="magnifying-glass"
        className="absolute left-2 top-1/2 block -translate-y-1/2 text-xs text-neutral-subtle transition-colors"
      />
      <input
        className={twMerge(
          'w-36 rounded border border-neutral bg-background py-1.5 pl-7 outline-0 transition-colors placeholder:text-neutral-subtle hover:border-neutral-component focus:outline-none',
          className
        )}
        placeholder="Search"
        {...props}
      />
    </span>
  )
}

export default TableFilterSearch

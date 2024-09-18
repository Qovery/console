import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type PropsWithChildren, useState } from 'react'
import { Icon, InputSearch, Popover, Tooltip, Truncate, dropdownMenuItemVariants } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useVariables } from '../hooks/use-variables/use-variables'

export interface DropdownVariableProps extends PropsWithChildren {
  environmentId: string
  onChange: (value: string) => void
}

export function DropdownVariable({ environmentId, onChange, children }: DropdownVariableProps) {
  const { data: variables = [] } = useVariables({
    parentId: environmentId,
    scope: 'ENVIRONMENT',
  })
  const [open, setOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const filteredVariables = variables.filter((variable) =>
    variable.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // XXX: https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using DropdownMenu.Root in combination of Popover.Root
  // to get the flexibility of Popover.Root but keeping the accessiblity of
  // DropdownMenu.Root for entries.
  // So both open state should be sync
  return (
    <DropdownMenu.Root open={open} onOpenChange={(open) => setOpen(open)}>
      <Popover.Root open={open} onOpenChange={(open) => setOpen(open)}>
        <Popover.Trigger>{children}</Popover.Trigger>
        <DropdownMenu.Content asChild>
          <Popover.Content className="flex max-h-60 w-[248px] min-w-[248px] flex-col p-2">
            {/* 
                `stopPropagation` is used to prevent the event from `DropdownMenu.Root` parent
                fix issue with item focus if we use input search
                https://github.com/radix-ui/primitives/issues/2193#issuecomment-1790564604 
              */}
            <div className="bg-white dark:bg-neutral-700" onKeyDown={(e) => e.stopPropagation()}>
              <InputSearch
                placeholder="Search..."
                className="mb-1"
                onChange={(value) => setSearchTerm(value)}
                autofocus
              />
            </div>
            <div className="overflow-y-auto">
              {filteredVariables.length > 0 ? (
                filteredVariables.map((variable) => (
                  <Popover.Close key={variable.key} onClick={() => setSearchTerm('')}>
                    <DropdownMenu.Item
                      className={twMerge(
                        dropdownMenuItemVariants({ color: 'brand' }),
                        'flex h-[52px] items-center justify-between gap-1 px-2 py-1.5'
                      )}
                      onClick={() => onChange(variable.key)}
                    >
                      <div className="flex flex-col items-start justify-center gap-1">
                        <span className="text-sm font-medium">
                          <Truncate text={variable.key} truncateLimit={21} />
                        </span>

                        {variable.service_name ? (
                          <span className="truncate text-xs font-normal">
                            <Truncate text={variable.service_name} truncateLimit={30} />
                          </span>
                        ) : (
                          <span className="text-xs font-normal text-neutral-300">no service</span>
                        )}
                      </div>
                      {variable.description && (
                        <Tooltip content={variable.description} side="bottom">
                          <span>
                            <Icon iconName="info-circle" iconStyle="regular" className="text-neutral-400" />
                          </span>
                        </Tooltip>
                      )}
                    </DropdownMenu.Item>
                  </Popover.Close>
                ))
              ) : (
                <div className="px-3 py-6 text-center">
                  <Icon iconName="wave-pulse" className="text-neutral-350" />
                  <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
                </div>
              )}
            </div>
          </Popover.Content>
        </DropdownMenu.Content>
      </Popover.Root>
    </DropdownMenu.Root>
  )
}

export default DropdownVariable

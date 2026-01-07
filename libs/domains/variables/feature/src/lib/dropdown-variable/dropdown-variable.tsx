import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren, useCallback, useState } from 'react'
import { type VariableScope } from '@qovery/domains/variables/data-access'
import { Icon, InputSearch, Popover, Tooltip, Truncate, dropdownMenuItemVariants } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useVariables } from '../hooks/use-variables/use-variables'

export interface DropdownVariableProps extends PropsWithChildren {
  environmentId: string
  onChange: (value: string) => void
  onOpenChange?: (open: boolean) => void
  serviceId?: string
  scope?: VariableScope
  disableBuiltInVariables?: boolean
}

export function DropdownVariable({
  environmentId,
  serviceId,
  scope,
  onChange,
  children,
  onOpenChange,
  disableBuiltInVariables = false,
}: DropdownVariableProps) {
  // Determine which scope to query based on provided props
  const parentIdToUse = serviceId || environmentId
  const scopeToUse = serviceId && scope ? scope : 'ENVIRONMENT'

  const { data: variables = [] } = useVariables({
    parentId: parentIdToUse,
    scope: scopeToUse,
  })
  const [open, setOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const filteredVariables = variables.filter((variable) =>
    variable.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const _onOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  // XXX: https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using DropdownMenu.Root in combination of Popover.Root
  // to get the flexibility of Popover.Root but keeping the accessiblity of
  // DropdownMenu.Root for entries.
  // So both open state should be sync
  return (
    <DropdownMenu.Root open={open} onOpenChange={_onOpenChange}>
      <Popover.Root open={open} onOpenChange={_onOpenChange}>
        <Popover.Trigger>{children}</Popover.Trigger>
        <DropdownMenu.Content asChild>
          <Popover.Content className="flex max-h-60 w-[400px] min-w-[400px] flex-col p-2">
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
            <div className="max-h-[200px] overflow-y-auto">
              {filteredVariables.length > 0 ? (
                filteredVariables.map((variable) => {
                  const isBuiltIn = variable.scope === APIVariableScopeEnum.BUILT_IN
                  const isDisabled = isBuiltIn && disableBuiltInVariables

                  const itemContent = (
                    <DropdownMenu.Item
                      className={twMerge(
                        dropdownMenuItemVariants({ color: 'brand' }),
                        'flex h-[52px] items-center justify-between gap-1 px-2 py-1.5',
                        isDisabled && 'cursor-not-allowed opacity-50'
                      )}
                      onClick={() => !isDisabled && onChange(variable.key)}
                      disabled={isDisabled}
                    >
                      <div className="flex flex-col items-start justify-center gap-1">
                        <span className="text-sm font-medium">
                          <Truncate text={variable.key} truncateLimit={35} />
                        </span>

                        {variable.service_name ? (
                          <span className="truncate text-xs font-normal">
                            <Truncate text={variable.service_name} truncateLimit={40} />
                          </span>
                        ) : (
                          <span className="text-xs font-normal text-neutral-300">no service</span>
                        )}
                      </div>
                      {isDisabled ? (
                        <Tooltip
                          content="Built-in variables injection is not supported for Helm. Please create an alias to use this variable."
                          side="left"
                        >
                          <span>
                            <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-400" />
                          </span>
                        </Tooltip>
                      ) : (
                        variable.description && (
                          <Tooltip content={variable.description} side="bottom">
                            <span>
                              <Icon iconName="info-circle" iconStyle="regular" className="text-neutral-400" />
                            </span>
                          </Tooltip>
                        )
                      )}
                    </DropdownMenu.Item>
                  )

                  return isDisabled ? (
                    <div key={variable.key}>{itemContent}</div>
                  ) : (
                    <Popover.Close key={variable.key} onClick={() => setSearchTerm('')}>
                      {itemContent}
                    </Popover.Close>
                  )
                })
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

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type PropsWithChildren, useCallback, useState } from 'react'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type VariableScope } from '@qovery/domains/variables/data-access'
import { Icon, InputSearch, Popover, Tooltip, Truncate, dropdownMenuItemVariants } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useVariables } from '../hooks/use-variables/use-variables'

export interface DropdownVariableProps extends PropsWithChildren {
  environmentId: string
  projectId?: string
  onChange: (value: string) => void
  onOpenChange?: (open: boolean) => void
  container?: HTMLElement | null
  serviceId?: string
  scope?: VariableScope
  disableBuiltInVariables?: boolean
}

export function DropdownVariable({
  environmentId,
  projectId,
  serviceId,
  scope,
  onChange,
  children,
  onOpenChange,
  container,
  disableBuiltInVariables = false,
}: DropdownVariableProps) {
  // Determine which scope to query based on provided props
  const parentIdToUse = serviceId || environmentId
  const scopeToUse = (serviceId && scope) ? scope : 'ENVIRONMENT'

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
          <Popover.Content
            container={container}
            side="right"
            align="start"
            sideOffset={8}
            avoidCollisions={true}
            collisionPadding={8}
            sticky="partial"
            className="flex h-auto max-h-[240px] w-[400px] max-w-[400px] flex-col p-2"
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              // Let the InputSearch autofocus handle focusing
            }}
          >
            {/*
                `stopPropagation` is used to prevent the event from `DropdownMenu.Root` parent
                fix issue with item focus if we use input search
                https://github.com/radix-ui/primitives/issues/2193#issuecomment-1790564604
              */}
            <DropdownMenu.Label asChild>
              <div
                className="mb-1 bg-white dark:bg-neutral-700"
                onKeyDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <InputSearch placeholder="Search..." onChange={(value) => setSearchTerm(value)} autofocus />
              </div>
            </DropdownMenu.Label>
            <div
              className="max-h-[200px] overflow-y-auto"
              onWheel={(e) => {
                e.stopPropagation()
              }}
            >
              {filteredVariables.length > 0 ? (
                filteredVariables.map((variable) => {
                  const isBuiltIn = variable.scope === APIVariableScopeEnum.BUILT_IN
                  const isDisabled = isBuiltIn && disableBuiltInVariables

                  const itemContent = (
                    <DropdownMenu.Item
                      className={twMerge(
                        dropdownMenuItemVariants({ color: 'brand' }),
                        'flex h-[52px] flex-col items-start justify-center px-2 py-1.5',
                        isDisabled && 'cursor-not-allowed opacity-50'
                      )}
                      onClick={() => !isDisabled && onChange(variable.key)}
                      disabled={isDisabled}
                    >
                      <div className="flex w-full min-w-0 items-center gap-2">
                        <span className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                          {variable.key}
                        </span>
                        {isDisabled ? (
                          <Tooltip
                            content="Built-in variables injection is not supported for Helm. Please create an alias to use this variable."
                            side="left"
                          >
                            <span className="flex-shrink-0">
                              <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-400" />
                            </span>
                          </Tooltip>
                        ) : (
                          variable.description && (
                            <Tooltip content={variable.description} side="bottom">
                              <span className="flex-shrink-0">
                                <Icon iconName="info-circle" iconStyle="regular" className="text-neutral-400" />
                              </span>
                            </Tooltip>
                          )
                        )}
                      </div>
                      {variable.service_name ? (
                        <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal">
                          {variable.service_name}
                        </span>
                      ) : (
                        <span className="text-xs font-normal text-neutral-300">no service</span>
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

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRef, useState } from 'react'
import {
  Button,
  Icon,
  InputSearch,
  InputTextSmall,
  type InputTextSmallProps,
  Popover,
  Truncate,
  dropdownMenuItemVariants,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useVariables } from '../hooks/use-variables/use-variables'

export interface FieldVariableSuggestionProps {
  environmentId: string
  onChange: (value: string) => void
  inputProps: InputTextSmallProps
  value?: string
  className?: string
}

export function FieldVariableSuggestion({
  environmentId,
  onChange,
  className,
  inputProps,
  value = '',
}: FieldVariableSuggestionProps) {
  const { data: variables = [] } = useVariables({
    parentId: environmentId,
    scope: 'ENVIRONMENT',
  })
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const filteredVariables = variables.filter((variable) =>
    variable.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInsertVariable = (variableKey: string) => {
    const input = inputRef.current
    if (!input) return

    const startPos = input.selectionStart ?? 0
    const endPos = input.selectionEnd ?? 0

    const newValue = value.substring(0, startPos) + `{{${variableKey}}}` + value.substring(endPos)

    onChange(newValue)
  }

  // XXX: https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using DropdownMenu.Root in combination of Popover.Root
  // to get the flexibility of Popover.Root but keeping the accessiblity of
  // DropdownMenu.Root for entries.
  // So both open state should be sync
  return (
    <div className={twMerge('flex w-[calc(100%+4px)]', className)}>
      <InputTextSmall ref={inputRef} {...inputProps} />
      <DropdownMenu.Root open={open} onOpenChange={(open) => setOpen(open)}>
        <Popover.Root open={open} onOpenChange={(open) => setOpen(open)}>
          <Popover.Trigger>
            <Button
              size="md"
              type="button"
              color="neutral"
              variant="surface"
              className="relative right-1 rounded-l-none"
            >
              <Icon iconName="wand-magic-sparkles" />
            </Button>
          </Popover.Trigger>
          <DropdownMenu.Content asChild>
            <Popover.Content className="flex max-h-60 w-[256px] flex-col p-2">
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
                          'h-[52px] flex-col items-start justify-center gap-1 px-2 py-1.5'
                        )}
                        onClick={() => handleInsertVariable(variable.key)}
                      >
                        <span className="text-sm font-medium">
                          <Truncate text={variable.key} truncateLimit={24} />
                        </span>

                        {variable.description && (
                          <span className="truncate text-xs font-normal">
                            <Truncate text={variable.description} truncateLimit={34} />
                          </span>
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
    </div>
  )
}

export default FieldVariableSuggestion

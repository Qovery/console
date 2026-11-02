import { useState } from 'react'
import { Button, Icon, InputSearch, Popover, dropdownMenuItemVariants } from '@qovery/shared/ui'
import { ALERT_VARIABLES } from './types'

export function VariableDropdown({ onInsert }: { onInsert: (variable: string) => void }) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = ALERT_VARIABLES.filter((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button
          aria-label="Insert variable"
          size="md"
          type="button"
          color="neutral"
          variant="surface"
          iconOnly
          className="absolute right-2 top-2 h-8 w-8 justify-center"
        >
          <Icon className="text-sm" iconName="wand-magic-sparkles" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="z-50 flex max-h-60 w-[300px] min-w-[300px] flex-col p-2">
        <div onKeyDown={(e) => e.stopPropagation()}>
          <InputSearch
            placeholder="Search variable..."
            className="mb-1"
            onChange={(value) => setSearchTerm(value)}
            autofocus
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((variable) => (
              <button
                key={variable}
                type="button"
                className={dropdownMenuItemVariants({ color: 'brand' })}
                onClick={() => {
                  onInsert(variable)
                  setOpen(false)
                  setSearchTerm('')
                }}
              >
                <span className="text-sm font-medium">{variable}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-6 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-subtle" />
              <p className="mt-1 text-xs font-medium text-neutral-subtle">No result for this search</p>
            </div>
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

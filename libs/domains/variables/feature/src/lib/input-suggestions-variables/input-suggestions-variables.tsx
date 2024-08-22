import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type PropsWithChildren, useState } from 'react'
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type UseFormStateReturn,
} from 'react-hook-form'
import { Button, Icon, Indicator, InputSearch, InputTextSmall, Popover, Tooltip, Truncate } from '@qovery/shared/ui'
import { useVariables } from '../hooks/use-variables/use-variables'

interface InputDropdownVariablesProps extends PropsWithChildren {
  environmentId: string
  controller: {
    // We can't define the type of `field` and `fieldState` because it's a generic type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: ControllerRenderProps<FieldValues, any>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FieldValues>
  }
}

export function InputDropdownVariables({
  environmentId,
  controller: {
    field,
    fieldState: { error },
  },
}: InputDropdownVariablesProps) {
  const { data: variables = [] } = useVariables({
    parentId: environmentId,
    scope: 'ENVIRONMENT',
  })
  const [open, setOpen] = useState(false)

  return (
    <Indicator
      side="right"
      align="center"
      className="right-6"
      content={
        <DropdownMenu.Root open={open} onOpenChange={(open) => setOpen(open)}>
          <Popover.Root open={open} onOpenChange={(open) => setOpen(open)}>
            <div>
              <Popover.Trigger>
                <Button size="md" type="button" color="neutral" variant="surface" className="rounded-l-none">
                  <Icon iconName="wand-magic-sparkles" />
                </Button>
              </Popover.Trigger>
            </div>
            <DropdownMenu.Content asChild>
              <Popover.Content className="h-60 w-[400px] overflow-y-scroll">
                <InputSearch placeholder="Search..." className="mb-4" />
                {variables.map((variable) => (
                  <Popover.Close>
                    <DropdownMenu.Item className="min-h-9 gap-2">
                      <Truncate text={variable.key} truncateLimit={38} />
                      {variable.description && (
                        <Tooltip content={variable.description}>
                          <span>
                            <Icon iconName="info-circle" className="text-neutral-350" />
                          </span>
                        </Tooltip>
                      )}
                    </DropdownMenu.Item>
                  </Popover.Close>
                ))}
              </Popover.Content>
            </DropdownMenu.Content>
          </Popover.Root>
        </DropdownMenu.Root>
      }
    >
      <InputTextSmall
        className="pr-10"
        classNameInput="rounded-r-none"
        name={field.name}
        value={field.value}
        onChange={field.onChange}
        error={error?.message}
      />
    </Indicator>
  )
}

export default InputDropdownVariables

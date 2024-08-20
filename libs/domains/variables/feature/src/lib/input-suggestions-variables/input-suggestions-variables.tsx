import { type PropsWithChildren } from 'react'
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type UseFormStateReturn,
} from 'react-hook-form'
import { Button, DropdownMenu, Icon, Indicator, InputTextSmall, Tooltip, Truncate } from '@qovery/shared/ui'
import { useVariables } from '../hooks/use-variables/use-variables'

interface InputDropdownVariablesProps extends PropsWithChildren {
  environmentId: string
  controller: {
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

  return (
    // <div className="inline-flex pr-10">
    <Indicator
      side="right"
      align="center"
      className="right-[23px]"
      content={
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button size="md" type="button" color="neutral" variant="surface" className="rounded-l-none">
              <Icon iconName="wand-magic-sparkles" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="h-60 w-[400px] overflow-y-scroll" onChange={field.onChange}>
            {variables.map((variable) => (
              <DropdownMenu.Item key={variable.id} className="min-h-9 gap-2">
                <Truncate text={variable.key} truncateLimit={38} />
                {variable.description && (
                  <Tooltip content={variable.description}>
                    <span>
                      <Icon iconName="info-circle" className="text-neutral-350" />
                    </span>
                  </Tooltip>
                )}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
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
    // </div>
  )
}

export default InputDropdownVariables

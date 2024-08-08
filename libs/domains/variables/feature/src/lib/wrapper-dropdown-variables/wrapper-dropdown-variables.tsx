import { type FormEventHandler, type PropsWithChildren } from 'react'
import { Button, DropdownMenu, Icon, Indicator, Tooltip, Truncate } from '@qovery/shared/ui'
import { useVariables } from '../hooks/use-variables/use-variables'

interface WrapperDropdownVariablesProps extends PropsWithChildren {
  environmentId: string
  onSelect?: FormEventHandler | undefined
}

export function WrapperDropdownVariables({ environmentId, onSelect, children }: WrapperDropdownVariablesProps) {
  const { data: variables = [] } = useVariables({
    parentId: environmentId,
    scope: 'ENVIRONMENT',
  })

  return (
    <Indicator
      side="right"
      align="center"
      className="mr-4"
      content={
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button size="md" type="button" className="rounded-l-none">
              <Icon iconName="wand-magic-sparkles" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="h-60 w-[400px] overflow-y-scroll" onChange={onSelect}>
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
      <div className="pr-8">{children}</div>
    </Indicator>
  )
}

export default WrapperDropdownVariables

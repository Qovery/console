import { type Environment } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent } from 'react'
import { Button, DropdownMenu, Icon, Link, Tooltip } from '@qovery/shared/ui'

export interface ArgoCdServiceActionsProps {
  environment: Environment
  serviceId: string
  serviceName: string
  onAction?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void
  variant?: 'default' | 'header'
}

export function ArgoCdServiceActions({
  variant = 'default',
  environment,
  serviceId,
  serviceName,
  onAction,
}: ArgoCdServiceActionsProps) {
  const organizationId = environment.organization.id
  const projectId = environment.project.id
  const environmentId = environment.id

  return (
    <div className="flex items-center gap-1.5" onClick={onAction}>
      {variant === 'default' && (
        <Tooltip content="Logs">
          <Link
            aria-label={`Service logs for ${serviceName}`}
            as="button"
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs"
            params={{
              organizationId,
              projectId,
              environmentId,
              serviceId,
            }}
            color="neutral"
            variant="outline"
            size="sm"
            iconOnly
            onClick={onAction}
            onKeyDown={onAction}
          >
            <Icon iconName="scroll" />
          </Link>
        </Tooltip>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label={`Other actions for ${serviceName}`}
            variant="outline"
            size="sm"
            iconOnly
            onKeyDown={onAction}
          >
            <Tooltip content="Other actions">
              <div className="flex h-full w-full items-center justify-center">
                <Icon iconName="ellipsis-v" />
              </div>
            </Tooltip>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item icon={<Icon iconName="gear" />} asChild>
            <Link
              className="gap-0"
              to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/manifest"
              params={{
                organizationId,
                projectId,
                environmentId,
                serviceId,
              }}
            >
              See manifest
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

export default ArgoCdServiceActions

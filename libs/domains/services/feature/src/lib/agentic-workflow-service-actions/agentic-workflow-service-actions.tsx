import { useNavigate } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent } from 'react'
import { type AgenticWorkflow } from '@qovery/domains/services/data-access'
import { Button, DropdownMenu, Icon, Tooltip, useModalConfirmation } from '@qovery/shared/ui'
import { useDeleteService } from '../hooks/use-delete-service/use-delete-service'

export interface AgenticWorkflowServiceActionsProps {
  environment: Environment
  service: AgenticWorkflow
  onAction?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void
}

export function AgenticWorkflowServiceActions({ environment, service, onAction }: AgenticWorkflowServiceActionsProps) {
  const organizationId = environment.organization.id
  const projectId = environment.project.id
  const environmentId = environment.id
  const navigate = useNavigate()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteService } = useDeleteService({ organizationId, environmentId })

  const deleteAgenticWorkflow = () => {
    openModalConfirmation({
      title: `Delete ${service.name}?`,
      description:
        'This will permanently delete the agentic workflow and its associated data. This action cannot be undone.',
      name: service.name,
      action: async () => {
        await deleteService({ serviceId: service.id, serviceType: service.serviceType })
        navigate({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
          params: { organizationId, projectId, environmentId },
        })
      },
    })
  }

  return (
    <div onClick={onAction}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label={`Other actions for ${service.name}`}
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
          <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />} onSelect={deleteAgenticWorkflow}>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

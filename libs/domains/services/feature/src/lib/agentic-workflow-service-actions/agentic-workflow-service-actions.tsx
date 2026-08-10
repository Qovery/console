import { Link, useNavigate } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent, useState } from 'react'
import { type AgenticWorkflow } from '@qovery/domains/services/data-access'
import { Button, DropdownMenu, Icon, Tooltip, useModalConfirmation } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { useDeleteService } from '../hooks/use-delete-service/use-delete-service'

export interface AgenticWorkflowServiceActionsProps {
  environment: Environment
  service: AgenticWorkflow
  onAction?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void
  variant?: 'default' | 'header'
}

export function AgenticWorkflowServiceActions({
  environment,
  service,
  onAction,
  variant = 'default',
}: AgenticWorkflowServiceActionsProps) {
  const organizationId = environment.organization.id
  const projectId = environment.project.id
  const environmentId = environment.id
  const navigate = useNavigate()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteService } = useDeleteService({ organizationId, environmentId })
  const [copiedMetadataLabel, setCopiedMetadataLabel] = useState<string>()
  const [, copyToClipboard] = useCopyToClipboard()
  const metadata = [
    { label: 'Cluster ID', value: environment.cluster_id },
    { label: 'Organization ID', value: organizationId },
    { label: 'Project ID', value: projectId },
    { label: 'Environment ID', value: environmentId },
    { label: 'Service ID', value: service.id },
  ]

  const copyMetadata = ({ label, value }: { label: string; value: string }) => {
    copyToClipboard(value)
    setCopiedMetadataLabel(label)
    setTimeout(() => setCopiedMetadataLabel(undefined), 1000)
  }

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
            size={variant === 'header' ? 'md' : 'sm'}
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
          <DropdownMenu.Item icon={<Icon iconName="clock-rotate-left" />} asChild>
            <Link
              className="gap-0"
              to="/organization/$organizationId/audit-logs"
              params={{ organizationId }}
              search={{
                targetId: service.id,
                targetType: undefined,
                projectId,
                environmentId,
              }}
            >
              Audit logs
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger icon={<Icon iconName="circle-info" />}>Service metadata</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent className="w-[290px]">
              <div className="flex flex-col gap-1 px-1 py-1">
                {metadata.map(({ label, value }) => (
                  <DropdownMenu.Item
                    key={label}
                    className="grid h-auto grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-2 px-2 py-1.5"
                    onSelect={(event) => {
                      event.preventDefault()
                      copyMetadata({ label, value })
                    }}
                  >
                    <span className="text-ssm text-neutral-subtle">{label}</span>
                    <span className="truncate font-mono text-ssm text-neutral" title={value}>
                      {value}
                    </span>
                    <Icon
                      iconName={copiedMetadataLabel === label ? 'check' : 'copy'}
                      className="justify-self-end text-ssm text-neutral-subtle"
                    />
                  </DropdownMenu.Item>
                ))}
              </div>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />} onSelect={deleteAgenticWorkflow}>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

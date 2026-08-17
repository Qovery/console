import { useParams } from '@tanstack/react-router'
import { type McpServerResponse } from 'qovery-typescript-axios'
import { Suspense, useMemo } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  Badge,
  BlockContent,
  Button,
  EmptyState,
  Icon,
  Section,
  Skeleton,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useDeleteMcpServer } from '../hooks/use-delete-mcp-server/use-delete-mcp-server'
import { useMcpServers } from '../hooks/use-mcp-servers/use-mcp-servers'
import { McpServerCreateEditModal } from '../mcp-server-create-edit-modal/mcp-server-create-edit-modal'

interface McpServerRowProps {
  organizationId: string
  mcpServer: McpServerResponse
}

function McpServerRow({ organizationId, mcpServer }: McpServerRowProps) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteMcpServer } = useDeleteMcpServer()
  const headerNames = Array.from(mcpServer.header_names ?? [])

  const onEdit = () => {
    openModal({
      content: <McpServerCreateEditModal organizationId={organizationId} mcpServer={mcpServer} onClose={closeModal} />,
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  const onDelete = () => {
    openModalConfirmation({
      title: 'Delete MCP connector',
      confirmationMethod: 'action',
      name: mcpServer.name,
      action: async () => {
        try {
          await deleteMcpServer({ organizationId, mcpServerId: mcpServer.id })
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  return (
    <li
      data-testid={`mcp-server-${mcpServer.id}`}
      className="flex items-start justify-between gap-4 border-b border-neutral p-4 last:border-0"
    >
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral bg-surface-neutral-subtle">
          <Icon iconName="plug" iconStyle="regular" className="text-sm text-neutral-subtle" />
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-medium text-neutral">
            <Truncate truncateLimit={60} text={mcpServer.name} />
          </h3>
          {mcpServer.description ? <p className="text-sm text-neutral-subtle">{mcpServer.description}</p> : null}
          <p className="break-all font-mono text-xs text-neutral-subtle">{mcpServer.url}</p>
          {headerNames.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1" aria-label="Configured headers">
              {[...headerNames]
                .sort((a, b) => a.localeCompare(b))
                .map((headerName) => (
                  <Badge key={headerName} size="sm" variant="surface" color="neutral" className="font-mono">
                    {headerName}
                  </Badge>
                ))}
            </div>
          ) : null}
          <p className="pt-1 text-xs text-neutral-subtle">
            <span title={dateUTCString(mcpServer.updated_at)}>Updated {timeAgo(new Date(mcpServer.updated_at))}</span>
            <span className="ml-3" title={dateUTCString(mcpServer.created_at)}>
              Created {dateMediumLocalFormat(mcpServer.created_at)}
            </span>
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          size="md"
          variant="outline"
          color="neutral"
          iconOnly
          aria-label={`Edit ${mcpServer.name}`}
          onClick={onEdit}
        >
          <Icon iconName="gear" iconStyle="regular" />
        </Button>
        <Button
          size="md"
          variant="outline"
          color="neutral"
          iconOnly
          aria-label={`Delete ${mcpServer.name}`}
          onClick={onDelete}
        >
          <Icon iconName="trash-can" iconStyle="regular" />
        </Button>
      </div>
    </li>
  )
}

function McpServersSkeleton() {
  return (
    <BlockContent title="MCP connectors" classNameContent="p-0">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex items-center justify-between gap-4 border-b border-neutral p-4 last:border-0">
          <div className="flex items-center gap-4">
            <Skeleton width={32} height={32} show />
            <div className="space-y-2">
              <Skeleton width={180} height={14} show />
              <Skeleton width={320} height={12} show />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton width={32} height={32} show />
            <Skeleton width={32} height={32} show />
          </div>
        </div>
      ))}
    </BlockContent>
  )
}

interface McpServersListProps {
  organizationId: string
}

function McpServersList({ organizationId }: McpServersListProps) {
  const { data: mcpServers = [] } = useMcpServers({ organizationId, suspense: true })
  const sortedMcpServers = useMemo(
    () => [...mcpServers].sort((first, second) => first.name.localeCompare(second.name)),
    [mcpServers]
  )

  return sortedMcpServers.length > 0 ? (
    <BlockContent title="MCP connectors" classNameContent="p-0">
      <ul>
        {sortedMcpServers.map((mcpServer) => (
          <McpServerRow key={mcpServer.id} organizationId={organizationId} mcpServer={mcpServer} />
        ))}
      </ul>
    </BlockContent>
  ) : (
    <EmptyState
      icon="plug"
      title="No MCP connectors"
      description="Add a connector to give Qovery Agent access to tools shared across your organization."
    />
  )
}

export function SettingsAgentPersonalization() {
  useDocumentTitle('Agent personalization - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()

  const onAdd = () => {
    openModal({
      content: <McpServerCreateEditModal organizationId={organizationId} onClose={closeModal} />,
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="px-8 pb-8 pt-6">
        <div className="relative">
          <SettingsHeading title="Agent personalization" description="Your personal settings for Qovery Agent" />
          <Button className="absolute right-0 top-0" size="md" onClick={onAdd}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add connector
          </Button>
        </div>

        <div className="max-w-content-with-navigation-left space-y-4">
          <p className="text-sm text-neutral-subtle">
            MCP connectors are shared with every Qovery Agent in this organization.
          </p>
          <Suspense fallback={<McpServersSkeleton />}>
            <McpServersList organizationId={organizationId} />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}

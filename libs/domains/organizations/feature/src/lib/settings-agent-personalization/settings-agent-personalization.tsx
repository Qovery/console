import { useAuth0 } from '@auth0/auth0-react'
import { useParams } from '@tanstack/react-router'
import {
  type LlmProviderResponse,
  LlmProviderScope,
  LlmProviderType,
  type McpServerResponse,
  McpServerScope,
} from 'qovery-typescript-axios'
import { type ReactNode, Suspense, useMemo } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  Badge,
  BlockContent,
  Button,
  EmptyState,
  Heading,
  Icon,
  Section,
  Skeleton,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useDeleteLlmProvider } from '../hooks/use-delete-llm-provider/use-delete-llm-provider'
import { useDeleteMcpServer } from '../hooks/use-delete-mcp-server/use-delete-mcp-server'
import { useLlmProviders } from '../hooks/use-llm-providers/use-llm-providers'
import { useMcpServers } from '../hooks/use-mcp-servers/use-mcp-servers'
import { LlmProviderCreateEditModal } from '../llm-provider-create-edit-modal/llm-provider-create-edit-modal'
import { McpServerCreateEditModal } from '../mcp-server-create-edit-modal/mcp-server-create-edit-modal'

interface McpServerRowProps {
  organizationId: string
  mcpServer: McpServerResponse
}

function McpServerRow({ organizationId, mcpServer }: McpServerRowProps) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteMcpServer } = useDeleteMcpServer()
  const owner =
    mcpServer.scope === McpServerScope.USER ? `Owner: ${mcpServer.owner_name ?? 'Unknown member'}` : undefined
  const onEdit = () => {
    openModal({
      content: <McpServerCreateEditModal mcpServer={mcpServer} onClose={closeModal} />,
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  const onDelete = () => {
    openModalConfirmation({
      title: 'Delete MCP',
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
      className="flex items-center justify-between gap-4 border-b border-neutral p-4 last:border-0"
    >
      <Section className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <Heading level={3} className="min-w-0">
            <Truncate truncateLimit={60} text={mcpServer.name} />
          </Heading>
          {mcpServer.description ? (
            <Tooltip content={mcpServer.description}>
              <span className="cursor-pointer" aria-label={`About ${mcpServer.name}`}>
                <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
              </span>
            </Tooltip>
          ) : null}
          {owner ? (
            <Tooltip content={owner}>
              <span className="min-w-0 truncate text-xs font-normal text-neutral-subtle">{owner}</span>
            </Tooltip>
          ) : null}
        </div>
        <p className="break-all font-mono text-xs text-neutral-subtle">{mcpServer.url}</p>
      </Section>
      <div className="flex shrink-0 gap-2">
        {mcpServer.scope === McpServerScope.ORGANIZATION || mcpServer.attachable ? (
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
        ) : null}
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
    <BlockContent title="MCPs" classNameContent="p-0">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex items-center justify-between gap-4 border-b border-neutral p-4 last:border-0">
          <div className="space-y-2">
            <Skeleton width={180} height={14} show />
            <Skeleton width={320} height={12} show />
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

interface LlmProviderRowProps {
  organizationId: string
  llmProvider: LlmProviderResponse
  currentUserSub?: string
}

function LlmProviderRow({ organizationId, llmProvider, currentUserSub }: LlmProviderRowProps) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteLlmProvider } = useDeleteLlmProvider()
  const owner =
    llmProvider.scope === LlmProviderScope.USER
      ? `Owner: ${llmProvider.owner_name ?? 'Unknown member'}`
      : undefined
  const canManage =
    llmProvider.scope === LlmProviderScope.ORGANIZATION ||
    Boolean(currentUserSub && llmProvider.owner_user_sub === currentUserSub)

  const onEdit = () => {
    openModal({
      content: <LlmProviderCreateEditModal llmProvider={llmProvider} onClose={closeModal} />,
      options: { fakeModal: true, width: 680 },
    })
  }

  const onDelete = () => {
    openModalConfirmation({
      title: 'Delete token',
      confirmationMethod: 'action',
      name: llmProvider.name,
      action: async () => {
        try {
          await deleteLlmProvider({ organizationId, llmProviderId: llmProvider.id })
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  return (
    <li
      data-testid={`llm-provider-${llmProvider.id}`}
      className="flex items-center justify-between gap-4 border-b border-neutral p-4 last:border-0"
    >
      <Section className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <img
            src={
              llmProvider.type === LlmProviderType.CLAUDE
                ? '/assets/ai-tools/claude.svg'
                : '/assets/devicon/bedrock.svg'
            }
            alt=""
            aria-hidden="true"
            className="h-5 w-5 rounded-sm"
          />
          <Heading level={3} className="min-w-0">
            <Truncate truncateLimit={60} text={llmProvider.name} />
          </Heading>
          {llmProvider.description ? (
            <Tooltip content={llmProvider.description}>
              <span className="cursor-pointer" aria-label={`About ${llmProvider.name}`}>
                <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
              </span>
            </Tooltip>
          ) : null}
          {!llmProvider.has_credential ? <Badge color="yellow">No token</Badge> : null}
        </div>
        {owner ? <p className="truncate text-xs text-neutral-subtle">{owner}</p> : null}
      </Section>
      {canManage ? (
        <div className="flex shrink-0 gap-2">
          <Button
            size="md"
            variant="outline"
            color="neutral"
            iconOnly
            aria-label={`Edit ${llmProvider.name}`}
            onClick={onEdit}
          >
            <Icon iconName="gear" iconStyle="regular" />
          </Button>
          <Button
            size="md"
            variant="outline"
            color="neutral"
            iconOnly
            aria-label={`Delete ${llmProvider.name}`}
            onClick={onDelete}
          >
            <Icon iconName="trash-can" iconStyle="regular" />
          </Button>
        </div>
      ) : null}
    </li>
  )
}

function LlmProvidersSkeleton() {
  return (
    <BlockContent title="Tokens" classNameContent="p-0">
      {[0, 1].map((index) => (
        <div key={index} className="flex items-center justify-between gap-4 border-b border-neutral p-4 last:border-0">
          <div className="space-y-2">
            <Skeleton width={180} height={14} show />
            <Skeleton width={100} height={12} show />
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

interface ScopedItem {
  id: string
  name: string
  scope: string
}

interface ScopedItemsListProps<T extends ScopedItem> {
  items: T[]
  organizationScope: string
  userScope: string
  organizationTitle: string
  personalTitle: string
  renderItem: (item: T) => ReactNode
}

function ScopedItemsList<T extends ScopedItem>({
  items,
  organizationScope,
  userScope,
  organizationTitle,
  personalTitle,
  renderItem,
}: ScopedItemsListProps<T>) {
  const sortedItems = useMemo(() => [...items].sort((first, second) => first.name.localeCompare(second.name)), [items])
  const personalItems = sortedItems.filter(({ scope }) => scope === userScope)
  const organizationItems = sortedItems.filter(({ scope }) => scope === organizationScope)
  const itemGroup = (title: string, groupedItems: T[]) => (
    <BlockContent title={title} classNameContent="p-0">
      <ul>{groupedItems.map(renderItem)}</ul>
    </BlockContent>
  )

  return (
    <div className="space-y-4">
      {organizationItems.length > 0 ? itemGroup(organizationTitle, organizationItems) : null}
      {personalItems.length > 0 ? itemGroup(personalTitle, personalItems) : null}
    </div>
  )
}

function LlmProvidersList({ organizationId }: { organizationId: string }) {
  const { data: llmProviders = [] } = useLlmProviders({ organizationId, suspense: true })
  const { user } = useAuth0()

  if (llmProviders.length === 0) {
    return (
      <EmptyState icon="key" title="No tokens" description="Add a provider token to authenticate your agent tasks." />
    )
  }

  return (
    <ScopedItemsList
      items={llmProviders}
      organizationScope={LlmProviderScope.ORGANIZATION}
      userScope={LlmProviderScope.USER}
      organizationTitle="Organization tokens"
      personalTitle="Personal token"
      renderItem={(llmProvider) => (
        <LlmProviderRow
          key={llmProvider.id}
          organizationId={organizationId}
          llmProvider={llmProvider}
          currentUserSub={user?.sub}
        />
      )}
    />
  )
}

interface McpServersListProps {
  organizationId: string
}

function McpServersList({ organizationId }: McpServersListProps) {
  const { data: mcpServers = [] } = useMcpServers({ organizationId, suspense: true })

  if (mcpServers.length === 0) {
    return (
      <EmptyState
        icon="plug"
        title="No MCPs"
        description="Add a personal MCP to give Qovery Agent access to your tools."
      />
    )
  }

  return (
    <ScopedItemsList
      items={mcpServers}
      organizationScope={McpServerScope.ORGANIZATION}
      userScope={McpServerScope.USER}
      organizationTitle="Organization MCPs"
      personalTitle="Personal MCPs"
      renderItem={(mcpServer) => (
        <McpServerRow key={mcpServer.id} organizationId={organizationId} mcpServer={mcpServer} />
      )}
    />
  )
}

export function SettingsAgentTokens() {
  useDocumentTitle('Agent tokens - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()

  const onAddToken = () => {
    openModal({
      content: <LlmProviderCreateEditModal onClose={closeModal} />,
      options: { fakeModal: true, width: 680 },
    })
  }

  return (
    <Section className="px-8 pb-8 pt-6">
      <div className="space-y-6">
        <SettingsHeading title="Tokens" description="Configure the provider credentials used by your agent tasks.">
          <Button size="md" onClick={onAddToken}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add token
          </Button>
        </SettingsHeading>
        <div className="max-w-content-with-navigation-left">
          <Suspense fallback={<LlmProvidersSkeleton />}>
            <LlmProvidersList organizationId={organizationId} />
          </Suspense>
        </div>
      </div>
    </Section>
  )
}

export function SettingsAgentMcps() {
  useDocumentTitle('Agent MCPs - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()

  const onAddMcp = () => {
    openModal({
      content: <McpServerCreateEditModal scope={McpServerScope.USER} onClose={closeModal} />,
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  return (
    <Section className="px-8 pb-8 pt-6">
      <div className="space-y-6">
        <SettingsHeading title="MCPs" description="Connect the tools and data sources available to your agent tasks.">
          <Button size="md" onClick={onAddMcp}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add MCP
          </Button>
        </SettingsHeading>
        <div className="max-w-content-with-navigation-left">
          <Suspense fallback={<McpServersSkeleton />}>
            <McpServersList organizationId={organizationId} />
          </Suspense>
        </div>
      </div>
    </Section>
  )
}

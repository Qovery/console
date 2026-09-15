import { useParams } from '@tanstack/react-router'
import { type McpServerResponse, McpServerScope } from 'qovery-typescript-axios'
import { useState } from 'react'
import { McpServerCreateEditModal } from '@qovery/domains/organizations/feature'
import { useUserRole } from '@qovery/shared/iam/feature'
import { Button, Heading, Icon, InputSearch, Tooltip, useModal } from '@qovery/shared/ui'
import { OverlaySheet, SheetHeader } from '../sheet/overlay-sheet'
import { getMcpServerDisplayName } from './qovery-mcp-server'

export function hasOrganizationMcpCreationPermission({
  isQoveryAdminUser,
  organizationId,
  roles,
}: {
  isQoveryAdminUser: boolean
  organizationId: string
  roles: string[]
}) {
  return (
    isQoveryAdminUser ||
    roles.some(
      (role) =>
        role.includes(`organization:${organizationId}:admin`) || role.includes(`organization:${organizationId}:owner`)
    )
  )
}

function McpServerPicker({
  createdMcpServers,
  isLoading,
  lockedMcpServerIds,
  mcpServers,
  onChange,
  onMcpServerCreated,
  value,
}: {
  createdMcpServers: McpServerResponse[]
  isLoading: boolean
  lockedMcpServerIds: string[]
  mcpServers: McpServerResponse[]
  onChange: (value: string[]) => void
  onMcpServerCreated: (mcpServer: McpServerResponse) => void
  value: string[]
}) {
  const { closeModal, openModal } = useModal()
  const { organizationId = '' } = useParams({ strict: false }) ?? {}
  const { isQoveryAdminUser, roles } = useUserRole()
  const [search, setSearch] = useState('')
  const canCreateOrganizationMcp = hasOrganizationMcpCreationPermission({
    isQoveryAdminUser,
    organizationId,
    roles,
  })
  const availableMcpServers = [...mcpServers, ...createdMcpServers].filter(
    (mcpServer, index, servers) => servers.findIndex(({ id }) => id === mcpServer.id) === index
  )
  const matchingMcpServers = availableMcpServers
    .filter(({ attachable, id }) => attachable || value.includes(id))
    .filter(({ name, url }) => `${name} ${url}`.toLowerCase().includes(search.trim().toLowerCase()))
  const connectedMcpServers = matchingMcpServers.filter(({ id }) => value.includes(id))
  const disconnectedMcpServers = matchingMcpServers.filter(({ id }) => !value.includes(id))
  const unlockedMcpServerIds = value.filter((id) => !lockedMcpServerIds.includes(id))

  const createMcpServer = () => {
    openModal({
      content: (
        <McpServerCreateEditModal
          scope={McpServerScope.USER}
          scopeOptions={[McpServerScope.USER, ...(canCreateOrganizationMcp ? [McpServerScope.ORGANIZATION] : [])]}
          onClose={(mcpServer) => {
            if (mcpServer) {
              onMcpServerCreated(mcpServer)
              onChange([...new Set([...value, mcpServer.id])])
            }
            closeModal()
          }}
        />
      ),
      options: { fakeModal: true, width: 680 },
    })
  }

  const mcpServerRow = (mcpServer: McpServerResponse, connected: boolean) => {
    const locked = connected && lockedMcpServerIds.includes(mcpServer.id)
    const displayName = getMcpServerDisplayName(mcpServer)
    const row = (
      <button
        type="button"
        disabled={locked}
        className="flex min-h-10 w-full items-center gap-3 rounded px-2 text-left hover:bg-surface-neutral-subtle focus-visible:outline-2 focus-visible:outline-neutral-strong disabled:opacity-50"
        aria-label={
          locked
            ? `${displayName} is required by Qovery service context`
            : connected
              ? `Remove ${displayName}`
              : `Add ${displayName}`
        }
        onClick={() =>
          onChange(connected ? value.filter((mcpServerId) => mcpServerId !== mcpServer.id) : [...value, mcpServer.id])
        }
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral bg-surface-neutral">
          <Icon iconName="plug" iconStyle="regular" className="text-neutral-subtle" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral">{displayName}</p>
          <p className="truncate text-xs text-neutral-subtle">
            {mcpServer.scope === McpServerScope.USER
              ? `Personal · ${mcpServer.owner_name ?? 'Unknown owner'}`
              : 'Organization'}
          </p>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
          <Icon iconName={connected ? 'circle-check' : 'plus'} className={connected ? 'text-positive' : undefined} />
        </span>
      </button>
    )

    return locked ? (
      <Tooltip
        key={mcpServer.id}
        content="This MCP is required by the selected Qovery service context and cannot be removed."
        classNameTrigger="block"
      >
        <span>{row}</span>
      </Tooltip>
    ) : (
      <span key={mcpServer.id}>{row}</span>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <InputSearch placeholder="Search MCP" autofocus onChange={setSearch} />
      {connectedMcpServers.length > 0 ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <Heading level={3} weight="medium">
              Connected ({connectedMcpServers.length})
            </Heading>
            <Button
              type="button"
              size="sm"
              color="neutral"
              variant="plain"
              disabled={unlockedMcpServerIds.length === 0}
              onClick={() => onChange(value.filter((id) => lockedMcpServerIds.includes(id)))}
            >
              Remove all
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {connectedMcpServers.map((mcpServer) => mcpServerRow(mcpServer, true))}
          </div>
        </section>
      ) : null}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <Heading level={3} weight="medium">
            Available MCPs
          </Heading>
          <Button type="button" size="sm" color="neutral" variant="outline" onClick={createMcpServer}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            New MCP
          </Button>
        </div>
        {isLoading ? (
          <p className="px-2 text-sm text-neutral-subtle">Loading MCPs...</p>
        ) : disconnectedMcpServers.length > 0 ? (
          <div className="flex flex-col gap-2">
            {disconnectedMcpServers.map((mcpServer) => mcpServerRow(mcpServer, false))}
          </div>
        ) : search.trim() ? (
          <p className="px-2 text-sm text-neutral-subtle">No MCP matches this search.</p>
        ) : null}
      </section>
    </div>
  )
}

export function McpSheet({
  createdMcpServers,
  isLoading,
  lockedMcpServerIds = [],
  mcpServers,
  onChange,
  onClose,
  onMcpServerCreated,
  value,
}: {
  createdMcpServers: McpServerResponse[]
  isLoading: boolean
  lockedMcpServerIds?: string[]
  mcpServers: McpServerResponse[]
  onChange: (value: string[]) => void
  onClose: () => void
  onMcpServerCreated: (mcpServer: McpServerResponse) => void
  value: string[]
}) {
  return (
    <OverlaySheet onClose={onClose}>
      <SheetHeader title="Manage MCP" description="Select the MCPs this agent task can use." onClose={onClose} />
      <div className="flex flex-1 flex-col overflow-auto px-5 pb-5">
        <McpServerPicker
          createdMcpServers={createdMcpServers}
          isLoading={isLoading}
          lockedMcpServerIds={lockedMcpServerIds}
          mcpServers={mcpServers}
          value={value}
          onChange={onChange}
          onMcpServerCreated={onMcpServerCreated}
        />
      </div>
      <div className="border-t border-neutral p-4">
        <Button type="button" className="w-full justify-center" size="lg" onClick={onClose}>
          Done
        </Button>
      </div>
    </OverlaySheet>
  )
}

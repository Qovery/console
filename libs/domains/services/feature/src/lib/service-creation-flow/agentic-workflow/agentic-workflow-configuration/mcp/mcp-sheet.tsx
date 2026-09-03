import { type McpServerResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { McpServerCreateEditModal } from '@qovery/domains/organizations/feature'
import { Button, Heading, Icon, InputSearch, useModal } from '@qovery/shared/ui'
import { OverlaySheet, SheetHeader } from '../sheet/overlay-sheet'

function McpServerPicker({
  createdMcpServers,
  isLoading,
  mcpServers,
  onChange,
  onMcpServerCreated,
  value,
}: {
  createdMcpServers: McpServerResponse[]
  isLoading: boolean
  mcpServers: McpServerResponse[]
  onChange: (value: string[]) => void
  onMcpServerCreated: (mcpServer: McpServerResponse) => void
  value: string[]
}) {
  const { closeModal, openModal } = useModal()
  const [search, setSearch] = useState('')
  const availableMcpServers = [...mcpServers, ...createdMcpServers].filter(
    (mcpServer, index, servers) => servers.findIndex(({ id }) => id === mcpServer.id) === index
  )
  const matchingMcpServers = availableMcpServers.filter(({ name, url }) =>
    `${name} ${url}`.toLowerCase().includes(search.trim().toLowerCase())
  )
  const connectedMcpServers = matchingMcpServers.filter(({ id }) => value.includes(id))
  const disconnectedMcpServers = matchingMcpServers.filter(({ id }) => !value.includes(id))

  const createMcpServer = () => {
    openModal({
      content: (
        <McpServerCreateEditModal
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

  const mcpServerRow = (mcpServer: McpServerResponse, connected: boolean) => (
    <button
      key={mcpServer.id}
      type="button"
      className="flex min-h-10 w-full items-center gap-3 rounded px-2 text-left hover:bg-surface-neutral-subtle focus-visible:outline-2 focus-visible:outline-neutral-strong"
      aria-label={connected ? `Remove ${mcpServer.name}` : `Add ${mcpServer.name}`}
      onClick={() =>
        onChange(connected ? value.filter((mcpServerId) => mcpServerId !== mcpServer.id) : [...value, mcpServer.id])
      }
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral bg-surface-neutral">
        <Icon iconName="plug" iconStyle="regular" className="text-neutral-subtle" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral">{mcpServer.name}</p>
        <p className="truncate text-xs text-neutral-subtle">{mcpServer.url}</p>
      </div>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <Icon iconName={connected ? 'circle-check' : 'plus'} className={connected ? 'text-positive' : undefined} />
      </span>
    </button>
  )

  return (
    <div className="flex flex-col gap-5">
      <InputSearch placeholder="Search MCP" autofocus onChange={setSearch} />
      {connectedMcpServers.length > 0 ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <Heading level={3} weight="medium">
              Connected ({connectedMcpServers.length})
            </Heading>
            <Button type="button" size="sm" color="neutral" variant="plain" onClick={() => onChange([])}>
              Remove all
            </Button>
          </div>
          <div>{connectedMcpServers.map((mcpServer) => mcpServerRow(mcpServer, true))}</div>
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
          <div>{disconnectedMcpServers.map((mcpServer) => mcpServerRow(mcpServer, false))}</div>
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
  mcpServers,
  onChange,
  onClose,
  onMcpServerCreated,
  value,
}: {
  createdMcpServers: McpServerResponse[]
  isLoading: boolean
  mcpServers: McpServerResponse[]
  onChange: (value: string[]) => void
  onClose: () => void
  onMcpServerCreated: (mcpServer: McpServerResponse) => void
  value: string[]
}) {
  return (
    <OverlaySheet onClose={onClose}>
      <SheetHeader
        title="Manage MCP"
        description="Select the organization MCPs this agent task can use."
        onClose={onClose}
      />
      <div className="flex flex-1 flex-col overflow-auto px-5 pb-5">
        <McpServerPicker
          createdMcpServers={createdMcpServers}
          isLoading={isLoading}
          mcpServers={mcpServers}
          value={value}
          onChange={onChange}
          onMcpServerCreated={onMcpServerCreated}
        />
      </div>
      <div className="border-t border-neutral p-4">
        <Button type="button" className="w-full justify-center" size="lg" onClick={onClose}>
          Save
        </Button>
      </div>
    </OverlaySheet>
  )
}

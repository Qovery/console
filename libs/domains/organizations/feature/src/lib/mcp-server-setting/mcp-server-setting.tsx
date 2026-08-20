import { type McpServerResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { InputSelect, useModal } from '@qovery/shared/ui'
import { McpServerCreateEditModal } from '../mcp-server-create-edit-modal/mcp-server-create-edit-modal'

export interface McpServerSettingProps {
  isLoading?: boolean
  mcpServers: McpServerResponse[]
  organizationId: string
  value: string[]
  onChange: (value: string[]) => void
}

export function McpServerSetting({ isLoading, mcpServers, organizationId, value, onChange }: McpServerSettingProps) {
  const { openModal, closeModal } = useModal()
  const [createdMcpServer, setCreatedMcpServer] = useState<McpServerResponse>()
  const availableMcpServers =
    createdMcpServer && !mcpServers.some(({ id }) => id === createdMcpServer.id)
      ? [...mcpServers, createdMcpServer]
      : mcpServers

  const openCreateModal = () => {
    openModal({
      content: (
        <McpServerCreateEditModal
          onClose={(response) => {
            if (response) {
              setCreatedMcpServer(response)
              onChange([...new Set([...value, response.id])])
            }
            closeModal()
          }}
        />
      ),
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  return (
    <InputSelect
      label="Organization MCPs"
      value={value}
      options={availableMcpServers.map(({ id, name, url }) => ({ value: id, label: name, description: url }))}
      isMulti
      isSearchable
      isLoading={isLoading}
      placeholder="Select MCPs"
      hint={
        mcpServers.length === 0 && !isLoading ? (
          <span>
            No MCP is configured. Create one here or manage MCPs in{' '}
            <a
              className="font-medium text-brand hover:underline"
              href={`/organization/${organizationId}/settings/agents`}
            >
              AI settings → Agents
            </a>
            .
          </span>
        ) : (
          'Select the organization MCPs this workflow can use.'
        )
      }
      menuListButton={{
        title: 'Select MCPs',
        label: 'New MCP',
        onClick: openCreateModal,
      }}
      onChange={(nextValue) => onChange(nextValue as string[])}
    />
  )
}

export default McpServerSetting

import { useParams } from '@tanstack/react-router'
import { type McpServerResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { useMcpServers } from '@qovery/domains/organizations/feature'
import {
  GitContextCard,
  GitContextCompactCard,
  GitContextModal,
  McpSheet,
  isGitRepositoryComplete,
} from '@qovery/domains/services/feature'
import { Button, Icon, useModal } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

export function AgenticWorkflowConnectionsSettings({
  form,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: mcpServers = [], isLoading } = useMcpServers({ organizationId })
  const { closeModal, openModal } = useModal()
  const [mcpSheetOpen, setMcpSheetOpen] = useState(false)
  const [createdMcpServers, setCreatedMcpServers] = useState<McpServerResponse[]>([])
  const repositories = form.watch('repositories')
  const mcpServerIds = form.watch('mcpServerIds')
  const repositoriesValid = repositories.every(isGitRepositoryComplete)
  const availableMcpServers = [...mcpServers, ...createdMcpServers].filter(
    (server, index, servers) => servers.findIndex(({ id }) => id === server.id) === index
  )

  const openGitContext = (index?: number) => {
    const repository = typeof index === 'number' ? repositories[index] : undefined

    openModal({
      content: (
        <GitContextModal
          context={repository}
          setOpen={(open) => !open && closeModal()}
          onRemove={
            typeof index === 'number'
              ? () => {
                  form.setValue(
                    'repositories',
                    repositories.filter((_, currentIndex) => currentIndex !== index),
                    { shouldDirty: true }
                  )
                  closeModal()
                }
              : undefined
          }
          onSave={(nextRepository) =>
            form.setValue(
              'repositories',
              typeof index === 'number'
                ? repositories.map((current, currentIndex) => (currentIndex === index ? nextRepository : current))
                : [...repositories, nextRepository],
              { shouldDirty: true }
            )
          }
        />
      ),
      options: { width: 488, fakeModal: true },
    })
  }

  return (
    <>
      <AgenticWorkflowSettingsCard title="Git context" description="Link repositories the agent can use as context.">
        {repositories.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {repositories.map((repository, index) => (
              <GitContextCompactCard
                key={`${repository.repository}-${index}`}
                provider={repository.provider}
                repository={repository.gitRepository?.name ?? repository.repository}
                onClick={() => openGitContext(index)}
              />
            ))}
          </div>
        ) : (
          <GitContextCard onClick={() => openGitContext()} />
        )}
        {repositories.length ? (
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            className="w-fit"
            onClick={() => openGitContext()}
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add repository
          </Button>
        ) : null}
        {!repositoriesValid ? (
          <p className="text-xs font-medium text-negative">Complete every Git repository.</p>
        ) : null}
      </AgenticWorkflowSettingsCard>

      <AgenticWorkflowSettingsCard title="MCP" description="Select the organization MCPs this agent task can use.">
        <div className="flex flex-wrap gap-2">
          {availableMcpServers
            .filter(({ id }) => mcpServerIds.includes(id))
            .map(({ id, name }) => (
              <Button
                key={id}
                type="button"
                variant="outline"
                color="neutral"
                size="sm"
                aria-label={`Remove ${name}`}
                onClick={() =>
                  form.setValue(
                    'mcpServerIds',
                    mcpServerIds.filter((current) => current !== id),
                    { shouldDirty: true }
                  )
                }
              >
                {name}
                <Icon iconName="xmark" />
              </Button>
            ))}
          <Button type="button" variant="outline" color="neutral" size="sm" onClick={() => setMcpSheetOpen(true)}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Manage MCP
          </Button>
        </div>
      </AgenticWorkflowSettingsCard>

      {mcpSheetOpen ? (
        <McpSheet
          isLoading={isLoading}
          mcpServers={mcpServers}
          createdMcpServers={createdMcpServers}
          value={mcpServerIds}
          onChange={(value) => form.setValue('mcpServerIds', value, { shouldDirty: true })}
          onClose={() => setMcpSheetOpen(false)}
          onMcpServerCreated={(server) => setCreatedMcpServers((servers) => [...servers, server])}
        />
      ) : null}
    </>
  )
}

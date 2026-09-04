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
import { Button, CodeEditor, Heading, Icon, Modal, Section, useModal } from '@qovery/shared/ui'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings.types'

function jsonError(value: string) {
  if (!value.trim()) return undefined

  try {
    JSON.parse(value)
    return undefined
  } catch {
    return 'Invalid JSON format.'
  }
}

function CodeConfigurationModal({
  description,
  language,
  onSave,
  setOpen,
  title,
  value,
}: {
  description: string
  language: string
  onSave: (value: string) => void
  setOpen: (open: boolean) => void
  title: string
  value: string
}) {
  const [draft, setDraft] = useState(value)
  const error = language === 'json' ? jsonError(draft) : undefined

  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {title}
        </Heading>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </div>
      <div className={`overflow-hidden rounded-md border ${error ? 'border-negative' : 'border-neutral'}`}>
        <CodeEditor
          height="320px"
          language={language}
          value={draft}
          onChange={(nextValue) => setDraft(nextValue ?? '')}
          options={{ scrollBeyondLastLine: false, wordWrap: 'on' }}
        />
      </div>
      {error ? <p className="text-xs font-medium text-negative">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="plain" color="neutral" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={Boolean(error)}
          onClick={() => {
            onSave(draft)
            setOpen(false)
          }}
        >
          Save
        </Button>
      </div>
    </Section>
  )
}

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
  const [codeModal, setCodeModal] = useState<'mcp' | 'docker' | null>(null)
  const repositories = form.watch('repositories')
  const mcpServerIds = form.watch('mcpServerIds')
  const mcp = form.watch('mcp')
  const dockerFragment = form.watch('dockerFragment')
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

      <AgenticWorkflowSettingsCard title="Advanced settings" description="Configure optional runtime customization.">
        {(
          [
            ['docker', 'Dockerfile fragment', dockerFragment],
            ['mcp', 'Advanced MCP configuration', mcp],
          ] as const
        ).map(([kind, label, value]) => (
          <div key={kind} className="flex items-center gap-3 rounded-lg border border-neutral bg-surface-neutral p-3">
            <Icon iconName="file-lines" iconStyle="regular" className="text-neutral-subtle" />
            <span className="min-w-0 flex-1 text-sm text-neutral">{label}</span>
            <Button type="button" variant="outline" color="neutral" size="xs" onClick={() => setCodeModal(kind)}>
              <Icon iconName={value ? 'pen' : 'plus'} iconStyle="regular" />
              {value ? 'Edit' : 'Add'}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="xs"
                iconOnly
                aria-label={`Delete ${label}`}
                onClick={() => form.setValue(kind === 'mcp' ? 'mcp' : 'dockerFragment', '', { shouldDirty: true })}
              >
                <Icon iconName="trash-can" iconStyle="regular" />
              </Button>
            ) : null}
          </div>
        ))}
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
      {codeModal ? (
        <Modal externalOpen setExternalOpen={(open) => !open && setCodeModal(null)} width={720}>
          <CodeConfigurationModal
            title={codeModal === 'mcp' ? 'Configure MCP JSON' : 'Configure Dockerfile fragment'}
            description={
              codeModal === 'mcp'
                ? 'Configure additional MCP servers with JSON.'
                : 'Add setup commands that run before the agent starts.'
            }
            language={codeModal === 'mcp' ? 'json' : 'dockerfile'}
            value={codeModal === 'mcp' ? mcp : dockerFragment}
            setOpen={(open) => !open && setCodeModal(null)}
            onSave={(value) =>
              form.setValue(codeModal === 'mcp' ? 'mcp' : 'dockerFragment', value, { shouldDirty: true })
            }
          />
        </Modal>
      ) : null}
    </>
  )
}

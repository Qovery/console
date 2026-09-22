import { useParams } from '@tanstack/react-router'
import { type McpServerResponse } from 'qovery-typescript-axios'
import { useRef, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { useCreateQoveryMcpServer, useMcpServers } from '@qovery/domains/organizations/feature'
import {
  GitContextCard,
  GitContextCompactCard,
  GitContextModal,
  McpSheet,
  QoveryServiceContextCard,
  QoveryServiceContextCompactCard,
  QoveryServiceContextModal,
  getMcpServerDisplayName,
  isGitRepositoryComplete,
  isQoveryMcpServer,
  replaceContextServicesInPrompt,
  useAgenticWorkflowContextServices,
} from '@qovery/domains/services/feature'
import { Button, Icon, Tooltip, useModal } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues, type SaveAgenticWorkflowSettings } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

export function AgenticWorkflowConnectionsSettings({
  form,
  gitTokensLoading,
  environmentId,
  isSaving,
  onSave,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
  gitTokensLoading: boolean
  environmentId: string
  isSaving?: boolean
  onSave?: SaveAgenticWorkflowSettings
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const {
    data: mcpServers = [],
    isError: mcpServersError,
    isLoading,
    refetch: refetchMcpServers,
  } = useMcpServers({ organizationId })
  const { mutateAsync: createQoveryMcpServer } = useCreateQoveryMcpServer()
  const {
    data: contextServices = [],
    isError: contextServicesError,
    isLoading: contextServicesLoading,
  } = useAgenticWorkflowContextServices(environmentId)
  const { closeModal, openModal } = useModal()
  const [mcpSheetOpen, setMcpSheetOpen] = useState(false)
  const [mcpDraft, setMcpDraft] = useState<string[]>([])
  const [createdMcpServers, setCreatedMcpServers] = useState<McpServerResponse[]>([])
  const contextAddedRequiredMcpServerIdRef = useRef<string>()
  const saveSettings: SaveAgenticWorkflowSettings =
    onSave ??
    (async (values) => {
      form.reset({ ...form.getValues(), ...values })
    })
  const repositories = form.watch('repositories')
  const mcpServerIds = form.watch('mcpServerIds')
  const contextServiceIds = form.watch('contextServiceIds')
  const repositoriesValid = repositories.every(isGitRepositoryComplete)
  const availableMcpServers = [...mcpServers, ...createdMcpServers].filter(
    (server, index, servers) => servers.findIndex(({ id }) => id === server.id) === index
  )
  const selectedContextServices = contextServices.filter(({ id }) => contextServiceIds.includes(id))
  const qoveryMcpServer = availableMcpServers.find((mcpServer) => mcpServer.attachable && isQoveryMcpServer(mcpServer))
  const qoveryMcpLockReason = contextServiceIds.length
    ? 'This MCP is required by the selected Qovery service context and cannot be removed.'
    : undefined

  const ensureQoveryMcpServer = async () => {
    let loadedMcpServers = mcpServers
    if (isLoading || mcpServersError) {
      const result = await refetchMcpServers()
      if (result.isError || !result.data) {
        throw result.error ?? new Error('Unable to load MCP servers')
      }
      loadedMcpServers = result.data
    }
    let mcpServer = [...loadedMcpServers, ...createdMcpServers].find(
      (mcpServer) => mcpServer.attachable && isQoveryMcpServer(mcpServer)
    )

    if (!mcpServer) {
      mcpServer = { ...(await createQoveryMcpServer({ organizationId })), attachable: true }
      setCreatedMcpServers((servers) => [...servers, mcpServer as McpServerResponse])
    }

    return mcpServer
  }

  const openGitContext = (index?: number) => {
    const repository = typeof index === 'number' ? repositories[index] : undefined

    openModal({
      content: (
        <GitContextModal
          context={repository}
          submitLabel="Save"
          setOpen={(open) => !open && closeModal()}
          onRemove={
            typeof index === 'number'
              ? () => {
                  void saveSettings({
                    repositories: repositories.filter((_, currentIndex) => currentIndex !== index),
                  })
                    .then(closeModal)
                    .catch(() => undefined)
                }
              : undefined
          }
          onSave={(nextRepository) =>
            saveSettings({
              repositories:
                typeof index === 'number'
                  ? repositories.map((current, currentIndex) => (currentIndex === index ? nextRepository : current))
                  : [...repositories, nextRepository],
            })
          }
        />
      ),
      options: { width: 488, fakeModal: true },
    })
  }

  const openQoveryServiceContext = () => {
    if (contextServicesLoading || contextServicesError || isLoading) return

    openModal({
      content: (
        <QoveryServiceContextModal
          isLoading={contextServicesLoading}
          services={contextServices}
          value={selectedContextServices}
          setOpen={(open) => !open && closeModal()}
          onSave={async (services) => {
            const mcpServer = services.length ? await ensureQoveryMcpServer() : qoveryMcpServer
            const mcpServerId = mcpServer?.id
            let nextRequiredMcpServerIds = form.getValues('requiredMcpServerIds')
            if (!services.length && mcpServerId && mcpServerId === contextAddedRequiredMcpServerIdRef.current) {
              nextRequiredMcpServerIds = nextRequiredMcpServerIds.filter((id) => id !== mcpServerId)
              contextAddedRequiredMcpServerIdRef.current = undefined
            }
            const nextMcpServerIds = mcpServerId
              ? [...new Set([...form.getValues('mcpServerIds'), mcpServerId])]
              : form.getValues('mcpServerIds')
            if (services.length && mcpServerId && !nextRequiredMcpServerIds.includes(mcpServerId)) {
              nextRequiredMcpServerIds = [...nextRequiredMcpServerIds, mcpServerId]
              contextAddedRequiredMcpServerIdRef.current = mcpServerId
            }
            await saveSettings({
              agentPrompt: replaceContextServicesInPrompt(form.getValues('agentPrompt'), services),
              contextServiceIds: services.map(({ id }) => id),
              mcpServerIds: nextMcpServerIds,
              requiredMcpServerIds: nextRequiredMcpServerIds,
            })
          }}
        />
      ),
      options: { width: 488, fakeModal: true },
    })
  }

  return (
    <>
      <AgenticWorkflowSettingsCard
        title="Qovery context"
        description="Select services from this environment that the agent task can use as context."
      >
        {selectedContextServices.length ? (
          <QoveryServiceContextCompactCard
            disabled={contextServicesLoading || contextServicesError || isLoading}
            names={selectedContextServices.map(({ name }) => name)}
            onClick={openQoveryServiceContext}
          />
        ) : (
          <QoveryServiceContextCard
            disabled={contextServicesLoading || contextServicesError || isLoading}
            onClick={openQoveryServiceContext}
          />
        )}
      </AgenticWorkflowSettingsCard>

      <AgenticWorkflowSettingsCard title="Git context" description="Link repositories the agent can use as context.">
        {repositories.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {repositories.map((repository, index) => (
              <GitContextCompactCard
                key={`${repository.repository}-${index}`}
                provider={repository.provider}
                repository={repository.gitRepository?.name ?? repository.repository}
                url={repository.gitRepository?.url ?? repository.repository}
                disabled={gitTokensLoading && Boolean(repository.gitTokenId) && !repository.provider}
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

      <AgenticWorkflowSettingsCard title="MCP" description="Select the MCPs this agent task can use.">
        <div className="flex flex-wrap gap-2">
          {availableMcpServers
            .filter(({ id }) => mcpServerIds.includes(id))
            .map((mcpServer) => {
              const { id } = mcpServer
              const displayName = getMcpServerDisplayName(mcpServer)
              const locked = Boolean(qoveryMcpLockReason && qoveryMcpServer?.id === id)
              const button = (
                <span className="rounded border border-neutral px-2 py-1 text-sm text-neutral">{displayName}</span>
              )

              return locked ? (
                <Tooltip key={id} content={qoveryMcpLockReason} classNameTrigger="block">
                  <span>{button}</span>
                </Tooltip>
              ) : (
                <span key={id}>{button}</span>
              )
            })}
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => {
              setMcpDraft(mcpServerIds)
              setMcpSheetOpen(true)
            }}
          >
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
          value={mcpDraft}
          lockedMcpServerIds={qoveryMcpLockReason && qoveryMcpServer ? [qoveryMcpServer.id] : []}
          lockedMcpServerReason={qoveryMcpLockReason}
          onChange={setMcpDraft}
          onClose={() => setMcpSheetOpen(false)}
          onSave={() => saveSettings({ mcpServerIds: mcpDraft })}
          isSaving={isSaving}
          onMcpServerCreated={(server) => setCreatedMcpServers((servers) => [...servers, server])}
        />
      ) : null}
    </>
  )
}

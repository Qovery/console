import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useNavigate, useParams } from '@tanstack/react-router'
import { type GitProviderEnum, type GitRepository } from 'qovery-typescript-axios'
import { type ReactNode, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { GitBranchSettings, GitProviderSetting, GitRepositorySetting } from '@qovery/domains/organizations/feature'
import { IconEnum } from '@qovery/shared/enums'
import { Button, CodeEditor, FunnelFlowBody, Icon, InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'
import {
  type AgenticWorkflowConfigurationSection,
  type AgenticWorkflowConnector,
  type AgenticWorkflowGitRepository,
  type AgenticWorkflowOutput,
  DEFAULT_CONNECTOR_JSON,
  useAgenticWorkflowCreateContext,
} from './agentic-workflow-context'

const outputTypes: { iconName: IconName; label: AgenticWorkflowOutput['type'] }[] = [
  { label: 'Slack', iconName: 'slack' },
  { label: 'Jira', iconName: 'jira' },
  { label: 'GitHub', iconName: 'github' },
  { label: 'Other', iconName: 'ellipsis' },
]

const connectorTypes: { iconName: IconName; label: AgenticWorkflowConnector['type'] }[] = outputTypes

const defaultMcpUrls: Record<Exclude<AgenticWorkflowConnector['type'], 'Other'>, string> = {
  Slack: 'https://mcp.slack.com/mcp',
  Jira: 'https://mcp.atlassian.com/v1/sse',
  GitHub: 'https://api.githubcopilot.com/mcp/',
}

function getDefaultIntegrationName(type: AgenticWorkflowConnector['type'] | AgenticWorkflowOutput['type']) {
  return type
}

function getNextIntegrationName(
  currentName: string,
  previousType: AgenticWorkflowConnector['type'] | AgenticWorkflowOutput['type'],
  nextType: AgenticWorkflowConnector['type'] | AgenticWorkflowOutput['type']
) {
  const trimmedName = currentName.trim()

  if (!trimmedName || trimmedName === getDefaultIntegrationName(previousType)) {
    return getDefaultIntegrationName(nextType)
  }

  return currentName
}

const sectionOrder: AgenticWorkflowConfigurationSection[] = [
  'service-information',
  'ai-model',
  'connectors',
  'git-repositories',
  'governance',
  'docker-fragment',
  'outputs',
  'agent-prompt',
]

function getJsonError(value: string, required = false) {
  if (!value.trim()) return required ? 'Please enter a valid JSON configuration.' : undefined

  try {
    JSON.parse(value)
    return undefined
  } catch {
    return 'Invalid JSON format.'
  }
}

function isSectionCompleted(
  section: AgenticWorkflowConfigurationSection,
  activeSection: AgenticWorkflowConfigurationSection
) {
  return sectionOrder.indexOf(section) < sectionOrder.indexOf(activeSection)
}

function getSectionTitle(section: AgenticWorkflowConfigurationSection) {
  const titles: Record<AgenticWorkflowConfigurationSection, string> = {
    'service-information': 'Service information',
    'ai-model': 'AI model',
    connectors: 'Connectors',
    'git-repositories': 'Git repositories',
    governance: 'Governance',
    'docker-fragment': 'Docker fragment',
    outputs: 'Outputs',
    'agent-prompt': 'Agent prompt',
  }

  return titles[section]
}

function isGitRepositoryComplete(repository: AgenticWorkflowGitRepository) {
  return Boolean(repository.gitTokenId && repository.repository.trim() && repository.branch.trim())
}

function isOutputComplete(output: AgenticWorkflowOutput) {
  return output.type === 'Other'
    ? Boolean(output.prompt.trim())
    : Boolean(output.url.trim() && output.authentication.trim())
}

function isConnectorComplete(connector: AgenticWorkflowConnector) {
  return Boolean(connector.url.trim())
}

function AgenticWorkflowSection({
  children,
  headerAction,
  iconName,
  invalid,
  section,
}: {
  children: ReactNode
  headerAction?: ReactNode
  iconName: IconName
  invalid?: boolean
  section: AgenticWorkflowConfigurationSection
}) {
  const { activeSection, setActiveSection } = useAgenticWorkflowCreateContext()
  const active = activeSection === section
  const completed = isSectionCompleted(section, activeSection)
  const showStatus = completed && !active
  const title = getSectionTitle(section)
  const headerContent = (
    <>
      <div className="flex items-center gap-2">
        <Icon iconName={iconName} className="text-sm text-neutral-subtle" />
        <h2
          className={`text-base font-medium leading-6 ${active || completed ? 'text-neutral' : 'text-neutral-subtle'}`}
        >
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {showStatus &&
          (invalid ? (
            <Icon iconName="circle-xmark" className="text-sm text-negative" />
          ) : (
            <Icon iconName="circle-check" className="text-sm text-positive" />
          ))}
      </div>
    </>
  )

  return (
    <section className="rounded-xl border border-neutral bg-surface-neutral shadow-sm">
      {active ? (
        <div className="relative flex min-h-[56px] items-center justify-between gap-3 px-4 py-4 pr-40">
          {headerContent}
          {headerAction && <div className="absolute right-4 top-1/2 -translate-y-1/2">{headerAction}</div>}
        </div>
      ) : (
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-t-xl px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
          aria-expanded={active}
          onClick={() => setActiveSection(section)}
        >
          {headerContent}
        </button>
      )}
      {active && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </section>
  )
}

function CodeEditorField({
  error,
  height = '180px',
  hint,
  label,
  language,
  name,
  onChange,
  placeholder,
  value,
}: {
  error?: string
  height?: string
  hint?: ReactNode
  label: string
  language: string
  name: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  return (
    <div data-testid={`code-editor-field-${name}`} className="flex flex-col gap-1">
      <label className="px-3 text-xs font-medium text-neutral" htmlFor={name}>
        {label}
      </label>
      <div
        id={name}
        className={`relative overflow-hidden rounded border bg-surface-neutral ${
          error ? 'border-negative' : 'border-neutral'
        }`}
      >
        {placeholder && !value.trim() && (
          <div className="pointer-events-none absolute left-[62px] top-[7px] z-10 max-w-[calc(100%-76px)] text-xs leading-5 text-neutral-subtle">
            {placeholder}
          </div>
        )}
        <CodeEditor
          height={height}
          language={language}
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? '')}
          options={{
            scrollbar: { alwaysConsumeMouseWheel: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
      {hint && !error && <p className="px-3 text-xs font-normal text-neutral-subtle">{hint}</p>}
      {error && <p className="px-3 text-xs font-medium text-negative">{error}</p>}
    </div>
  )
}

function AIModelCards() {
  const { form } = useAgenticWorkflowCreateContext()
  const selectedModel = form.watch('aiModel')

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className={`flex min-h-[104px] flex-col gap-2 rounded border p-4 text-left transition ${
          selectedModel === 'Claude'
            ? 'border-brand-strong bg-surface-brand-subtle'
            : 'border-neutral bg-surface-neutral-subtle hover:bg-surface-neutral-componentHover'
        }`}
        onClick={() => form.setValue('aiModel', 'Claude', { shouldDirty: true })}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral">
          <img src="/assets/ai-tools/claude.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          Claude
        </span>
        <span className="text-xs text-neutral-subtle">Anthropic model used by the workflow agent.</span>
      </button>
      <button
        type="button"
        className="flex min-h-[104px] cursor-not-allowed flex-col gap-2 rounded border border-neutral bg-surface-neutral-subtle p-4 text-left opacity-60"
        disabled
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral">
          <Icon name={IconEnum.AWS_GRAY} className="h-5 w-5" />
          Bedrock
        </span>
        <span className="text-xs text-neutral-subtle">Coming later.</span>
      </button>
    </div>
  )
}

function IntegrationTypeIcon({
  iconName,
  label,
  selected,
}: {
  iconName: IconName
  label: AgenticWorkflowConnector['type'] | AgenticWorkflowOutput['type']
  selected: boolean
}) {
  if (label === 'Slack') {
    return <Icon name={IconEnum.SLACK} className="h-5 w-5" />
  }

  if (label === 'GitHub') {
    return <Icon name={IconEnum.GITHUB} className="h-5 w-5" />
  }

  if (label === 'Jira') {
    return <img src="/assets/ai-tools/jira.svg" alt="" aria-hidden="true" className="h-5 w-5" />
  }

  return <Icon iconName={iconName} className={selected ? 'text-brand' : 'text-neutral-subtle'} />
}

function ConnectorTypeCards({
  onChange,
  value,
}: {
  onChange: (value: AgenticWorkflowConnector['type']) => void
  value: AgenticWorkflowConnector['type']
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {connectorTypes.map((connectorType) => {
        const selected = value === connectorType.label

        return (
          <button
            key={connectorType.label}
            type="button"
            className={`flex min-h-[82px] flex-col items-center justify-center gap-2 rounded border p-3 text-center transition ${
              selected
                ? 'border-brand-strong bg-surface-brand-subtle'
                : 'border-neutral bg-surface-neutral hover:bg-surface-neutral-componentHover'
            }`}
            onClick={() => onChange(connectorType.label)}
          >
            <span className="flex h-7 w-7 items-center justify-center">
              <IntegrationTypeIcon iconName={connectorType.iconName} label={connectorType.label} selected={selected} />
            </span>
            <span className="text-sm font-medium text-neutral">{connectorType.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function OutputTypeCards({
  onChange,
  value,
}: {
  onChange: (value: AgenticWorkflowOutput['type']) => void
  value: AgenticWorkflowOutput['type']
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {outputTypes.map((outputType) => {
        const selected = value === outputType.label

        return (
          <button
            key={outputType.label}
            type="button"
            className={`flex min-h-[82px] flex-col items-center justify-center gap-2 rounded border p-3 text-center transition ${
              selected
                ? 'border-brand-strong bg-surface-brand-subtle'
                : 'border-neutral bg-surface-neutral hover:bg-surface-neutral-componentHover'
            }`}
            onClick={() => onChange(outputType.label)}
          >
            <span className="flex h-7 w-7 items-center justify-center">
              <IntegrationTypeIcon iconName={outputType.iconName} label={outputType.label} selected={selected} />
            </span>
            <span className="text-sm font-medium text-neutral">{outputType.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function GitRepositoryCard({
  index,
  onChange,
  onRemove,
  repository,
}: {
  index: number
  onChange: (repository: AgenticWorkflowGitRepository) => void
  onRemove: () => void
  repository: AgenticWorkflowGitRepository
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const methods = useForm<{
    provider?: keyof typeof GitProviderEnum | string | null
    is_public_repository?: boolean
    repository: string
    branch: string
    git_token_name?: string | null
    git_token_id?: string | null
    git_repository?: GitRepository
  }>({
    defaultValues: {
      provider: repository.provider,
      is_public_repository: repository.isPublicRepository,
      repository: repository.repository,
      branch: repository.branch,
      git_token_name: repository.gitTokenName,
      git_token_id: repository.gitTokenId,
      git_repository: repository.gitRepository,
    },
    mode: 'onChange',
  })
  const provider = methods.watch('provider') as keyof typeof GitProviderEnum | undefined
  const watchedRepository = methods.watch('repository')
  const gitTokenId = methods.watch('git_token_id') ?? undefined
  const isPublicRepository = methods.watch('is_public_repository')

  useEffect(() => {
    const subscription = methods.watch((values) => {
      onChange({
        provider: values.provider,
        gitTokenId: values.git_token_id,
        gitTokenName: values.git_token_name,
        isPublicRepository: values.is_public_repository,
        repository: values.repository ?? '',
        gitRepository: values.git_repository as GitRepository | undefined,
        branch: values.branch ?? '',
      })
    })

    return () => subscription.unsubscribe()
  }, [methods, onChange])

  return (
    <div className="rounded-lg border border-neutral bg-surface-neutral p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral">Repository {index + 1}</span>
        <Button type="button" variant="plain" color="neutral" size="md" onClick={onRemove}>
          Remove
        </Button>
      </div>
      <FormProvider {...methods}>
        <div className="flex flex-col gap-3">
          <GitProviderSetting organizationId={organizationId} />
          {isPublicRepository ? null : (
            <>
              {provider && (
                <GitRepositorySetting organizationId={organizationId} gitProvider={provider} gitTokenId={gitTokenId} />
              )}
              {provider && watchedRepository && (
                <GitBranchSettings
                  organizationId={organizationId}
                  gitProvider={provider}
                  gitTokenId={gitTokenId}
                  hideRootPath
                />
              )}
            </>
          )}
        </div>
      </FormProvider>
    </div>
  )
}

export function AgenticWorkflowConfiguration() {
  const navigate = useNavigate()
  const { activeSection, creationFlowUrl, form, setActiveSection, setCurrentStep } = useAgenticWorkflowCreateContext()
  const values = form.watch()
  const { dirtyFields } = form.formState
  const connectorErrors = values.connectors.map((connector) => getJsonError(connector.mcpServersJson, true))
  const connectorHeadersErrors = values.connectors.map((connector) => getJsonError(connector.headersJson))
  const connectorsValid = values.connectors.every(isConnectorComplete)
  const modelSettingsJsonError = getJsonError(values.modelSettingsJson, true)
  const claudeConfigJsonError = getJsonError(values.claudeConfigJson, true)
  const gitRepositoriesValid = values.gitRepositories.every(isGitRepositoryComplete)
  const outputsValid = values.outputs.every(isOutputComplete)
  const showNameError = Boolean(dirtyFields.name) && !values.name.trim()
  const showModelApiKeyError = Boolean(dirtyFields.modelApiKey) && !values.modelApiKey.trim()
  const sectionInvalid: Record<AgenticWorkflowConfigurationSection, boolean> = {
    'service-information': !values.name.trim(),
    'ai-model': !values.modelApiKey.trim() || Boolean(modelSettingsJsonError),
    connectors: !connectorsValid || connectorErrors.some(Boolean) || connectorHeadersErrors.some(Boolean),
    'git-repositories': !gitRepositoriesValid,
    governance: Boolean(claudeConfigJsonError),
    'docker-fragment': false,
    outputs: !outputsValid,
    'agent-prompt': !values.agentPrompt.trim(),
  }
  const isValid =
    Boolean(values.name.trim()) &&
    Boolean(values.modelApiKey.trim()) &&
    Boolean(values.agentPrompt.trim()) &&
    gitRepositoriesValid &&
    outputsValid &&
    connectorsValid &&
    connectorErrors.every((error) => !error) &&
    connectorHeadersErrors.every((error) => !error) &&
    !modelSettingsJsonError &&
    !claudeConfigJsonError

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const goToNextSection = () => {
    const nextSection = sectionOrder[sectionOrder.indexOf(activeSection) + 1]

    if (nextSection) {
      setActiveSection(nextSection)
      return
    }

    navigate({ to: `${creationFlowUrl}/summary` })
  }

  const addConnector = () =>
    form.setValue(
      'connectors',
      [
        ...values.connectors,
        {
          type: 'Slack',
          name: getDefaultIntegrationName('Slack'),
          url: defaultMcpUrls.Slack,
          mcpServersJson: DEFAULT_CONNECTOR_JSON,
          headersJson: '{}',
        },
      ],
      {
        shouldDirty: true,
      }
    )

  const addRepository = () =>
    form.setValue(
      'gitRepositories',
      [
        ...values.gitRepositories,
        {
          provider: undefined,
          gitTokenId: undefined,
          gitTokenName: undefined,
          isPublicRepository: false,
          repository: '',
          gitRepository: undefined,
          branch: '',
        },
      ],
      { shouldDirty: true }
    )

  const addOutput = () =>
    form.setValue(
      'outputs',
      [
        ...values.outputs,
        {
          type: 'Slack',
          name: getDefaultIntegrationName('Slack'),
          url: defaultMcpUrls.Slack,
          authentication: '',
          prompt: '',
        },
      ],
      {
        shouldDirty: true,
      }
    )

  return (
    <FunnelFlowBody customContentWidth="max-w-[620px]">
      <header className="mb-5">
        <h1 className="text-2xl font-medium leading-8 text-neutral">Create agentic workflow</h1>
        <p className="mt-1 text-sm leading-5 text-neutral-subtle">
          Configure the inputs, tools, model, governance, and outputs used by your workflow.
        </p>
      </header>

      <div className="flex flex-col gap-3 pb-20">
        <AgenticWorkflowSection
          section="service-information"
          iconName="circle-info"
          invalid={sectionInvalid['service-information']}
        >
          <InputText
            name="name"
            label="Name"
            value={values.name}
            autoFocus
            error={showNameError ? 'Please enter a workflow name.' : undefined}
            onChange={(event) => form.setValue('name', event.currentTarget.value, { shouldDirty: true })}
          />
          <InputTextArea
            name="description"
            label="Description"
            value={values.description}
            onChange={(event) => form.setValue('description', event.currentTarget.value, { shouldDirty: true })}
          />
          <InputToggle
            small
            align="top"
            value={values.workflowEnabled}
            title="Enable workflow"
            description="Start listening and executing this workflow as soon as it is created."
            onChange={(value) => form.setValue('workflowEnabled', value, { shouldDirty: true })}
          />
          <ContinueButton disabled={!values.name.trim()} onClick={goToNextSection} />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection section="ai-model" iconName="brain-circuit" invalid={sectionInvalid['ai-model']}>
          <AIModelCards />
          <InputText
            name="model-api-key"
            label="API key"
            type="password"
            value={values.modelApiKey}
            hint="API key used to call the selected cloud model."
            error={showModelApiKeyError ? 'Please enter an API key.' : undefined}
            onChange={(event) => form.setValue('modelApiKey', event.currentTarget.value, { shouldDirty: true })}
          />
          <CodeEditorField
            name="model-settings"
            label="Model settings JSON"
            language="json"
            value={values.modelSettingsJson}
            error={modelSettingsJsonError}
            onChange={(value) => form.setValue('modelSettingsJson', value, { shouldDirty: true })}
          />
          <ContinueButton
            disabled={!values.modelApiKey.trim() || Boolean(modelSettingsJsonError)}
            onClick={goToNextSection}
          />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection
          section="connectors"
          iconName="plug"
          invalid={sectionInvalid.connectors}
          headerAction={
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="sm"
              className="h-8 w-fit whitespace-nowrap"
              onClick={addConnector}
            >
              <Icon iconName="plus" />
              Add connector
            </Button>
          }
        >
          {values.connectors.map((connector, index) => (
            <div key={index} className="rounded-lg border border-neutral bg-surface-neutral p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral">Connector {index + 1}</span>
                <Button
                  type="button"
                  variant="plain"
                  color="neutral"
                  size="md"
                  onClick={() =>
                    form.setValue(
                      'connectors',
                      values.connectors.filter((_, connectorIndex) => connectorIndex !== index),
                      { shouldDirty: true }
                    )
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                <ConnectorTypeCards
                  value={connector.type}
                  onChange={(type) => {
                    const connectors = [...values.connectors]
                    connectors[index] = {
                      ...connector,
                      type,
                      name: getNextIntegrationName(connector.name, connector.type, type),
                      url: type === 'Other' ? '' : defaultMcpUrls[type],
                    }
                    form.setValue('connectors', connectors, { shouldDirty: true })
                  }}
                />
                <InputText
                  name={`connector-name-${index}`}
                  label="Name"
                  value={connector.name}
                  onChange={(event) => {
                    const connectors = [...values.connectors]
                    connectors[index] = { ...connector, name: event.currentTarget.value }
                    form.setValue('connectors', connectors, { shouldDirty: true })
                  }}
                />
                <InputText
                  name={`connector-url-${index}`}
                  label="MCP URL"
                  value={connector.url}
                  error={!connector.url.trim() ? 'Please enter the connector MCP URL.' : undefined}
                  onChange={(event) => {
                    const connectors = [...values.connectors]
                    connectors[index] = { ...connector, url: event.currentTarget.value }
                    form.setValue('connectors', connectors, { shouldDirty: true })
                  }}
                />
                <CodeEditorField
                  name={`connector-headers-${index}`}
                  label="Request headers JSON"
                  language="json"
                  height="120px"
                  value={connector.headersJson}
                  error={connectorHeadersErrors[index]}
                  hint='Optional request headers. Example: { "Authorization": "Bearer {{TOKEN}}" }'
                  onChange={(value) => {
                    const connectors = [...values.connectors]
                    connectors[index] = { ...connector, headersJson: value }
                    form.setValue('connectors', connectors, { shouldDirty: true })
                  }}
                />
                <CodeEditorField
                  name={`connector-${index}`}
                  label="mcpServers JSON"
                  language="json"
                  value={connector.mcpServersJson}
                  error={connectorErrors[index]}
                  hint="Secret variables can be referenced with {{VAR_NAME}}."
                  onChange={(value) => {
                    const connectors = [...values.connectors]
                    connectors[index] = { ...connector, mcpServersJson: value }
                    form.setValue('connectors', connectors, { shouldDirty: true })
                  }}
                />
              </div>
            </div>
          ))}
          {!connectorsValid && (
            <p className="px-3 text-xs font-medium text-negative">Enter an MCP URL for each configured connector.</p>
          )}
          <ContinueButton
            disabled={!connectorsValid || connectorErrors.some(Boolean) || connectorHeadersErrors.some(Boolean)}
            onClick={goToNextSection}
          />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection
          section="git-repositories"
          iconName="code-branch"
          invalid={sectionInvalid['git-repositories']}
          headerAction={
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="sm"
              className="h-8 w-fit whitespace-nowrap"
              onClick={addRepository}
            >
              <Icon iconName="plus" />
              Add repository
            </Button>
          }
        >
          {values.gitRepositories.map((repository, index) => (
            <GitRepositoryCard
              key={index}
              index={index}
              repository={repository}
              onChange={(nextRepository) => {
                const gitRepositories = [...values.gitRepositories]
                gitRepositories[index] = nextRepository
                form.setValue('gitRepositories', gitRepositories, { shouldDirty: true })
              }}
              onRemove={() =>
                form.setValue(
                  'gitRepositories',
                  values.gitRepositories.filter((_, repositoryIndex) => repositoryIndex !== index),
                  { shouldDirty: true }
                )
              }
            />
          ))}
          {!gitRepositoriesValid && (
            <p className="px-3 text-xs font-medium text-negative">
              Select a Git account, repository, and branch for each repository.
            </p>
          )}
          <ContinueButton disabled={!gitRepositoriesValid} onClick={goToNextSection} />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection section="governance" iconName="shield-halved" invalid={sectionInvalid.governance}>
          <InputTextArea
            name="whitelist-hosts"
            label="Whitelist hosts"
            value={values.whitelistHosts}
            hint="Enter domains separated by commas. Example: api.github.com, jira.company.com. Hosts from configured connectors are automatically whitelisted."
            onChange={(event) => form.setValue('whitelistHosts', event.currentTarget.value, { shouldDirty: true })}
          />
          <CodeEditorField
            name="claude-config"
            label="Claude configuration JSON"
            language="json"
            value={values.claudeConfigJson}
            error={claudeConfigJsonError}
            hint={
              <>
                Need help with permissions and allowed routes? Use{' '}
                <a
                  href="https://claude-settings.nl/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand hover:underline"
                >
                  Claude settings generator
                </a>
                .
              </>
            }
            onChange={(value) => form.setValue('claudeConfigJson', value, { shouldDirty: true })}
          />
          <ContinueButton onClick={goToNextSection} />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection section="docker-fragment" iconName="box" invalid={sectionInvalid['docker-fragment']}>
          <CodeEditorField
            name="docker-fragment"
            label="Dockerfile fragment"
            language="dockerfile"
            value={values.dockerFragment}
            onChange={(value) => form.setValue('dockerFragment', value, { shouldDirty: true })}
          />
          <ContinueButton onClick={goToNextSection} />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection
          section="outputs"
          iconName="paper-plane"
          invalid={sectionInvalid.outputs}
          headerAction={
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="sm"
              className="h-8 w-fit whitespace-nowrap"
              onClick={addOutput}
            >
              <Icon iconName="plus" />
              Add output
            </Button>
          }
        >
          {values.outputs.map((output, index) => (
            <div key={index} className="rounded-lg border border-neutral bg-surface-neutral p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral">Output {index + 1}</span>
                <Button
                  type="button"
                  variant="plain"
                  color="neutral"
                  size="md"
                  onClick={() =>
                    form.setValue(
                      'outputs',
                      values.outputs.filter((_, outputIndex) => outputIndex !== index),
                      { shouldDirty: true }
                    )
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                <OutputTypeCards
                  value={output.type}
                  onChange={(type) => {
                    const outputs = [...values.outputs]
                    outputs[index] = {
                      ...output,
                      type,
                      name: getNextIntegrationName(output.name, output.type, type),
                      url: type === 'Other' ? '' : defaultMcpUrls[type],
                    }
                    form.setValue('outputs', outputs, { shouldDirty: true })
                  }}
                />
                <InputText
                  name={`output-name-${index}`}
                  label="Name"
                  value={output.name}
                  onChange={(event) => {
                    const outputs = [...values.outputs]
                    outputs[index] = { ...output, name: event.currentTarget.value }
                    form.setValue('outputs', outputs, { shouldDirty: true })
                  }}
                />
                {output.type !== 'Other' && (
                  <>
                    <InputText
                      name={`output-url-${index}`}
                      label="MCP URL"
                      value={output.url}
                      onChange={(event) => {
                        const outputs = [...values.outputs]
                        outputs[index] = { ...output, url: event.currentTarget.value }
                        form.setValue('outputs', outputs, { shouldDirty: true })
                      }}
                    />
                    <InputText
                      name={`output-authentication-${index}`}
                      label="Authentication"
                      hint="Bearer token or authentication string used by this output."
                      value={output.authentication}
                      onChange={(event) => {
                        const outputs = [...values.outputs]
                        outputs[index] = { ...output, authentication: event.currentTarget.value }
                        form.setValue('outputs', outputs, { shouldDirty: true })
                      }}
                    />
                  </>
                )}
                <InputTextArea
                  name={`output-prompt-${index}`}
                  label={output.type === 'Other' ? 'Instructions' : 'Prompt'}
                  hint={
                    output.type === 'Other'
                      ? 'Describe exactly what the agent should do with this custom output.'
                      : undefined
                  }
                  value={output.prompt}
                  onChange={(event) => {
                    const outputs = [...values.outputs]
                    outputs[index] = { ...output, prompt: event.currentTarget.value }
                    form.setValue('outputs', outputs, { shouldDirty: true })
                  }}
                />
              </div>
            </div>
          ))}
          {!outputsValid && (
            <p className="px-3 text-xs font-medium text-negative">
              Enter a URL and authentication value for each configured output. For Other, describe the expected output.
            </p>
          )}
          <ContinueButton disabled={!outputsValid} onClick={goToNextSection} />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection
          section="agent-prompt"
          iconName="message-lines"
          invalid={sectionInvalid['agent-prompt']}
        >
          <InputTextArea
            name="agent-prompt"
            label="Agent prompt"
            value={values.agentPrompt}
            hint="Describe the workflow behavior. Example: review incoming webhook payloads, open a pull request when needed, then notify the team."
            onChange={(event) => form.setValue('agentPrompt', event.currentTarget.value, { shouldDirty: true })}
          />
          <ContinueButton disabled={!values.agentPrompt.trim()} onClick={goToNextSection} />
        </AgenticWorkflowSection>
      </div>

      <footer className="fixed bottom-0 left-1/2 z-header w-full max-w-[620px] -translate-x-1/2 bg-background px-8 pb-4">
        <div className="border-t border-neutral pt-4">
          <Button
            type="button"
            size="lg"
            className="w-full justify-center"
            disabled={!isValid}
            onClick={() => navigate({ to: `${creationFlowUrl}/summary` })}
          >
            Confirm configuration
            <Icon iconName="arrow-right" />
          </Button>
        </div>
      </footer>
    </FunnelFlowBody>
  )
}

function ContinueButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <Button type="button" size="md" color="neutral" className="w-fit" disabled={disabled} onClick={onClick}>
      Continue
      <Icon iconName="arrow-right" />
    </Button>
  )
}

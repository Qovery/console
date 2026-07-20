import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useNavigate } from '@tanstack/react-router'
import { type ReactNode, useEffect, useRef } from 'react'
import { Button, CodeEditor, FunnelFlowBody, Icon, InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'
import {
  type AgenticWorkflowConfigurationSection,
  type AgenticWorkflowGitRepository,
  type AgenticWorkflowOutput,
  DEFAULT_CONNECTOR_JSON,
  MCP_CONNECTOR_JSON_EXAMPLE,
  useAgenticWorkflowCreateContext,
} from '../agentic-workflow-context'
import { AIModelCards } from './ai-model-cards'
import { GitRepositoryCard } from './git-repository-card'

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

export function getJsonError(value: string, required = false) {
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
    connectors: 'MCPs',
    'git-repositories': 'Git repositories',
    governance: 'Governance',
    'docker-fragment': 'Docker fragment',
    outputs: 'Output webhooks',
    'agent-prompt': 'Agent prompt',
  }

  return titles[section]
}

export function isGitRepositoryComplete(repository: AgenticWorkflowGitRepository) {
  return Boolean(
    repository.gitTokenId && repository.repository.trim() && repository.branch.trim() && (repository.rootPath || '/').trim()
  )
}

export function isOutputComplete(output: AgenticWorkflowOutput) {
  return Boolean(output.url.trim())
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
      {hint && !error && <div className="flex flex-col gap-2 px-3 text-xs font-normal text-neutral-subtle">{hint}</div>}
      {error && <p className="px-3 text-xs font-medium text-negative">{error}</p>}
    </div>
  )
}

export function AgenticWorkflowConfiguration() {
  const navigate = useNavigate()
  const { activeSection, creationFlowUrl, form, setActiveSection, setCurrentStep } = useAgenticWorkflowCreateContext()
  const modelApiKeyInputRef = useRef<HTMLInputElement>(null)
  const whitelistHostsTextareaRef = useRef<HTMLTextAreaElement>(null)
  const agentPromptTextareaRef = useRef<HTMLTextAreaElement>(null)
  const values = form.watch()
  const { dirtyFields } = form.formState
  const connectorErrors = values.connectors.map((connector) => getJsonError(connector.mcpServersJson, true))
  const outputHeadersErrors = values.outputs.map((output) => getJsonError(output.headersJson))
  const modelSettingsJsonError = getJsonError(values.modelSettingsJson, true)
  const gitRepositoriesValid = values.gitRepositories.every(isGitRepositoryComplete)
  const outputsValid = values.outputs.every(isOutputComplete)
  const showNameError = Boolean(dirtyFields.name) && !values.name.trim()
  const showModelApiKeyError = Boolean(dirtyFields.modelApiKey) && !values.modelApiKey.trim()
  const sectionInvalid: Record<AgenticWorkflowConfigurationSection, boolean> = {
    'service-information': !values.name.trim(),
    'ai-model': !values.modelApiKey.trim() || Boolean(modelSettingsJsonError),
    connectors: connectorErrors.some(Boolean),
    'git-repositories': !gitRepositoriesValid,
    governance: false,
    'docker-fragment': false,
    outputs: !outputsValid || outputHeadersErrors.some(Boolean),
    'agent-prompt': !values.agentPrompt.trim(),
  }
  const isValid =
    Boolean(values.name.trim()) &&
    Boolean(values.modelApiKey.trim()) &&
    Boolean(values.agentPrompt.trim()) &&
    gitRepositoriesValid &&
    outputsValid &&
    connectorErrors.every((error) => !error) &&
    outputHeadersErrors.every((error) => !error) &&
    !modelSettingsJsonError

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  useEffect(() => {
    const inputBySection: Partial<Record<AgenticWorkflowConfigurationSection, HTMLElement | null>> = {
      'ai-model': modelApiKeyInputRef.current,
      governance: whitelistHostsTextareaRef.current,
      'agent-prompt': agentPromptTextareaRef.current,
    }

    window.requestAnimationFrame(() => inputBySection[activeSection]?.focus())
  }, [activeSection])

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
          mcpServersJson: DEFAULT_CONNECTOR_JSON,
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
          rootPath: '/',
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
          url: '',
          headersJson: `{
  "Authorization": "Bearer {{TOKEN}}"
}`,
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
          <div className="grid gap-3 sm:grid-cols-3">
            <InputText
              name="cpu"
              label="CPU (mCPU)"
              type="number"
              value={values.cpu}
              onChange={(event) => form.setValue('cpu', event.currentTarget.value, { shouldDirty: true })}
            />
            <InputText
              name="memory"
              label="Memory (MB)"
              type="number"
              value={values.memory}
              onChange={(event) => form.setValue('memory', event.currentTarget.value, { shouldDirty: true })}
            />
            <InputText
              name="storage"
              label="Storage (GB)"
              type="number"
              value={values.storage}
              onChange={(event) => form.setValue('storage', event.currentTarget.value, { shouldDirty: true })}
            />
          </div>
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
            ref={modelApiKeyInputRef}
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
            hint={
              <>
                Need help configuring Claude Code settings? Read the{' '}
                <a
                  href="https://code.claude.com/docs/en/settings"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand hover:underline"
                >
                  Claude Code settings documentation
                </a>
                .
              </>
            }
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
              Add MCP
            </Button>
          }
        >
          {values.connectors.map((connector, index) => (
            <div key={index} className="rounded-lg border border-neutral bg-surface-neutral p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral">MCP {index + 1}</span>
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
              <CodeEditorField
                name={`mcp-${index}`}
                label="MCP JSON"
                language="json"
                value={connector.mcpServersJson}
                error={connectorErrors[index]}
                hint={
                  <>
                    <span>
                      See Claude Code docs for{' '}
                      <a
                        href="https://code.claude.com/docs/fr/mcp#option-1-add-a-remote-http-server"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-brand hover:underline"
                      >
                        remote HTTP
                      </a>{' '}
                      and{' '}
                      <a
                        href="https://code.claude.com/docs/fr/mcp#option-3-add-a-local-stdio-server"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-brand hover:underline"
                      >
                        local stdio
                      </a>{' '}
                      servers.
                    </span>
                    <span>Example:</span>
                    <pre className="overflow-auto rounded border border-neutral bg-surface-neutral px-3 py-2 font-mono text-xs text-neutral">
                      {MCP_CONNECTOR_JSON_EXAMPLE}
                    </pre>
                  </>
                }
                onChange={(value) => {
                  const connectors = [...values.connectors]
                  connectors[index] = { ...connector, mcpServersJson: value }
                  form.setValue('connectors', connectors, { shouldDirty: true })
                }}
              />
            </div>
          ))}
          <ContinueButton disabled={connectorErrors.some(Boolean)} onClick={goToNextSection} />
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
            ref={whitelistHostsTextareaRef}
            name="whitelist-hosts"
            label="Domain allowlist"
            value={values.whitelistHosts}
            hint="Use * to allow all domains, or enter hostnames separated by commas. Example: api.github.com, jira.company.com."
            onChange={(event) => form.setValue('whitelistHosts', event.currentTarget.value, { shouldDirty: true })}
          />
          <ContinueButton onClick={goToNextSection} />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection section="docker-fragment" iconName="box" invalid={sectionInvalid['docker-fragment']}>
          <CodeEditorField
            name="docker-fragment"
            label="Dockerfile fragment"
            language="dockerfile"
            value={values.dockerFragment}
            hint="Use this to install CLI or binary. Example: RUN npm install -g @modelcontextprotocol/server-github."
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
              Add webhook
            </Button>
          }
        >
          {values.outputs.map((output, index) => (
            <div key={index} className="rounded-lg border border-neutral bg-surface-neutral p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral">Webhook {index + 1}</span>
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
                <InputText
                  name={`output-url-${index}`}
                  label="Webhook URL"
                  value={output.url}
                  error={!output.url.trim() ? 'Please enter the output webhook URL.' : undefined}
                  onChange={(event) => {
                    const outputs = [...values.outputs]
                    outputs[index] = { ...output, url: event.currentTarget.value }
                    form.setValue('outputs', outputs, { shouldDirty: true })
                  }}
                />
                <CodeEditorField
                  name={`output-headers-${index}`}
                  label="Request headers JSON"
                  language="json"
                  height="120px"
                  value={output.headersJson}
                  error={outputHeadersErrors[index]}
                  hint='Optional request headers. Example: { "Authorization": "Bearer {{TOKEN}}" }'
                  onChange={(value) => {
                    const outputs = [...values.outputs]
                    outputs[index] = { ...output, headersJson: value }
                    form.setValue('outputs', outputs, { shouldDirty: true })
                  }}
                />
                <InputTextArea
                  name={`output-prompt-${index}`}
                  label="Prompt"
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
              Enter a webhook URL for each configured output webhook.
            </p>
          )}
          <ContinueButton disabled={!outputsValid || outputHeadersErrors.some(Boolean)} onClick={goToNextSection} />
        </AgenticWorkflowSection>

        <AgenticWorkflowSection
          section="agent-prompt"
          iconName="message-lines"
          invalid={sectionInvalid['agent-prompt']}
        >
          <InputTextArea
            ref={agentPromptTextareaRef}
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

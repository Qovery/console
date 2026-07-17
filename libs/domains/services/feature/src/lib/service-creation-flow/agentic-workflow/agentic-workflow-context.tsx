import { type GitProviderEnum, type GitRepository } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useContext, useState } from 'react'
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form'
import { FunnelFlow } from '@qovery/shared/ui'

const DEFAULT_MODEL_SETTINGS = `{
  "provider": "anthropic",
  "model": "claude-sonnet-4",
  "temperature": 0.2
}`

const DEFAULT_CLAUDE_CONFIG = `{
  "tools": [],
  "commands": []
}`

export const DEFAULT_CONNECTOR_JSON = `{
  "mcpServers": {}
}`

export const agenticWorkflowCreationSteps: { title: string }[] = [{ title: 'Configuration' }, { title: 'Summary' }]

export type AgenticWorkflowConfigurationSection =
  | 'service-information'
  | 'ai-model'
  | 'connectors'
  | 'git-repositories'
  | 'governance'
  | 'docker-fragment'
  | 'outputs'
  | 'agent-prompt'

export interface AgenticWorkflowOutput {
  type: 'Slack' | 'Jira' | 'GitHub' | 'Other'
  name: string
  url: string
  authentication: string
  prompt: string
}

export interface AgenticWorkflowGitRepository {
  provider?: keyof typeof GitProviderEnum | string | null
  gitTokenId?: string | null
  gitTokenName?: string | null
  isPublicRepository?: boolean
  repository: string
  gitRepository?: GitRepository
  branch: string
}

export interface AgenticWorkflowConnector {
  type: 'Slack' | 'Jira' | 'GitHub' | 'Other'
  name: string
  url: string
  mcpServersJson: string
  headersJson: string
}

export interface AgenticWorkflowFormData {
  name: string
  description: string
  workflowEnabled: boolean
  aiModel: 'Claude' | 'Bedrock'
  webhookEnabled: boolean
  connectors: AgenticWorkflowConnector[]
  gitRepositories: AgenticWorkflowGitRepository[]
  modelApiKey: string
  modelSettingsJson: string
  ipAllowlist: string
  claudeConfigJson: string
  dockerFragment: string
  outputs: AgenticWorkflowOutput[]
  agentPrompt: string
}

export interface AgenticWorkflowCreateContextInterface {
  activeSection: AgenticWorkflowConfigurationSection
  creationFlowUrl: string
  currentStep: number
  form: UseFormReturn<AgenticWorkflowFormData>
  setActiveSection: (section: AgenticWorkflowConfigurationSection) => void
  setCurrentStep: (step: number) => void
}

const AgenticWorkflowCreateContext = createContext<AgenticWorkflowCreateContextInterface | undefined>(undefined)

export function useAgenticWorkflowCreateContext() {
  const context = useContext(AgenticWorkflowCreateContext)

  if (!context) {
    throw new Error('useAgenticWorkflowCreateContext must be used within AgenticWorkflowCreationFlow')
  }

  return context
}

export interface AgenticWorkflowCreationFlowProps extends PropsWithChildren {
  creationFlowUrl: string
  onExit: () => void
}

export function AgenticWorkflowCreationFlow({ children, creationFlowUrl, onExit }: AgenticWorkflowCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [activeSection, setActiveSection] = useState<AgenticWorkflowConfigurationSection>('service-information')
  const form = useForm<AgenticWorkflowFormData>({
    defaultValues: {
      name: '',
      description: '',
      workflowEnabled: true,
      aiModel: 'Claude',
      webhookEnabled: true,
      connectors: [],
      gitRepositories: [],
      modelApiKey: '',
      modelSettingsJson: DEFAULT_MODEL_SETTINGS,
      ipAllowlist: '',
      claudeConfigJson: DEFAULT_CLAUDE_CONFIG,
      dockerFragment: '',
      outputs: [],
      agentPrompt: '',
    },
    mode: 'onChange',
  })

  return (
    <AgenticWorkflowCreateContext.Provider
      value={{ activeSection, creationFlowUrl, currentStep, form, setActiveSection, setCurrentStep }}
    >
      <FormProvider {...form}>
        <FunnelFlow
          totalSteps={agenticWorkflowCreationSteps.length}
          currentStep={currentStep}
          currentTitle={agenticWorkflowCreationSteps[currentStep - 1]?.title}
          onExit={onExit}
        >
          {children}
        </FunnelFlow>
      </FormProvider>
    </AgenticWorkflowCreateContext.Provider>
  )
}

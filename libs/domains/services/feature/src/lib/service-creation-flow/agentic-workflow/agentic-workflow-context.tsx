import { AgenticWorkflowModelType, type GitProviderEnum, type GitRepository } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useContext, useState } from 'react'
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form'
import { FunnelFlow } from '@qovery/shared/ui'

const DEFAULT_MODEL_SETTINGS = `{
  "provider": "anthropic",
  "models": [
    {
      "name": "claude-sonnet-4"
    },
    {
      "name": "claude-haiku-4"
    }
  ],
  "extendedThinking": false,
  "tools": [
    "Agent",
    "Bash",
    "Edit",
    "Glob",
    "Grep",
    "LSP",
    "NotebookEdit",
    "Read",
    "Skill",
    "TaskCreate",
    "TaskGet",
    "TaskList",
    "TaskUpdate",
    "TodoWrite",
    "WebFetch",
    "WebSearch",
    "Write"
  ]
}`

export const MCP_CONNECTOR_JSON_EXAMPLE = `{
  "mcpServers": {
    "investigator": {
      "type": "stdio",
      "command": "target/debug/mcp_server_example",
      "args": [],
      "env": {
        "INVESTIGATOR_TOKEN": "{{INVESTIGATOR_TOKEN}}"
      }
    },
    "costory": {
      "type": "http",
      "url": "https://app-api.costory.io/mcp",
      "headers": {
        "Authorization": "Bearer {{COSTORY_TOKEN}}"
      }
    }
  }
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
  url: string
  headersJson: string
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

export interface AgenticWorkflowFormData {
  name: string
  description: string
  cpu: string
  memory: string
  storage: string
  workflowEnabled: boolean
  aiModel: AgenticWorkflowModelType
  webhookEnabled: boolean
  mcpJson: string
  gitRepositories: AgenticWorkflowGitRepository[]
  modelApiKey: string
  modelSettingsJson: string
  whitelistHosts: string
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
      cpu: '2000',
      memory: '2048',
      storage: '10',
      workflowEnabled: true,
      aiModel: AgenticWorkflowModelType.CLAUDE,
      webhookEnabled: true,
      mcpJson: MCP_CONNECTOR_JSON_EXAMPLE,
      gitRepositories: [],
      modelApiKey: '',
      modelSettingsJson: DEFAULT_MODEL_SETTINGS,
      whitelistHosts: '*',
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

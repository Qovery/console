import {
  AgenticWorkflowExecutionMode,
  AgenticWorkflowModelType,
  type GitProviderEnum,
  type GitRepository,
} from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useContext } from 'react'
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form'
import { type FlowVariableData } from '@qovery/shared/interfaces'

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
  executionMode: AgenticWorkflowExecutionMode
  scheduleEnabled: boolean
  scheduleCronExpression: string
  timezone: string
  aiModel: AgenticWorkflowModelType
  webhookEnabled: boolean
  mcpServerIds: string[]
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
  form: UseFormReturn<AgenticWorkflowFormData>
  onExit: () => void
  variablesForm: UseFormReturn<FlowVariableData>
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
  onExit: () => void
}

export function AgenticWorkflowCreationFlow({ children, onExit }: AgenticWorkflowCreationFlowProps) {
  const variablesForm = useForm<FlowVariableData>({
    defaultValues: { variables: [], externalSecrets: [] },
    mode: 'onChange',
  })
  const form = useForm<AgenticWorkflowFormData>({
    defaultValues: {
      name: '',
      description: '',
      cpu: '2000',
      memory: '2048',
      storage: '10',
      workflowEnabled: true,
      executionMode: AgenticWorkflowExecutionMode.IN_PLACE,
      scheduleEnabled: false,
      scheduleCronExpression: '0 8 * * 1-5',
      timezone: 'Etc/UTC',
      aiModel: AgenticWorkflowModelType.CLAUDE,
      webhookEnabled: true,
      mcpServerIds: [],
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
      value={{
        form,
        onExit,
        variablesForm,
      }}
    >
      <FormProvider {...form}>
        <div className="absolute inset-0 flex min-h-0 bg-background">{children}</div>
      </FormProvider>
    </AgenticWorkflowCreateContext.Provider>
  )
}

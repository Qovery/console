import {
  AgenticWorkflowExecutionMode,
  AgenticWorkflowModelType,
  type GitProviderEnum,
  type GitRepository,
} from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useContext, useState } from 'react'
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

export interface AgenticWorkflowOutput {
  name?: string
  url: string | null
  headersJson: string
  prompt: string
}

export type AgenticWorkflowAutomationTriggerType = 'schedule' | 'webhook'

export interface AgenticWorkflowAutomationTrigger {
  id: string
  type: AgenticWorkflowAutomationTriggerType
  cronExpression?: string
  timezone?: string
}

export interface AgenticWorkflowAutomation {
  id: string
  triggers: AgenticWorkflowAutomationTrigger[]
  outputs: AgenticWorkflowOutput[]
}

// The API only supports a single automation, so we keep exactly one. It starts
// empty — the user adds its triggers (schedule or webhook) and outputs.
export function createDefaultAutomation(): AgenticWorkflowAutomation {
  return {
    id: crypto.randomUUID(),
    triggers: [],
    outputs: [],
  }
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
  executionMode: AgenticWorkflowExecutionMode
  aiModel: AgenticWorkflowModelType
  mcpServerIds: string[]
  mcpJson: string
  gitRepositories: AgenticWorkflowGitRepository[]
  modelApiKey: string
  modelSettingsJson: string
  whitelistHosts: string
  dockerFragment: string
  automations: AgenticWorkflowAutomation[]
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

export function getAgenticWorkflowDefaults(): AgenticWorkflowFormData {
  return {
    name: '',
    description: '',
    cpu: '2000',
    memory: '2048',
    storage: '10',
    executionMode: AgenticWorkflowExecutionMode.IN_PLACE,
    aiModel: AgenticWorkflowModelType.CLAUDE,
    mcpServerIds: [],
    mcpJson: '',
    gitRepositories: [],
    modelApiKey: '',
    modelSettingsJson: DEFAULT_MODEL_SETTINGS,
    whitelistHosts: '*',
    dockerFragment: '',
    automations: [],
    agentPrompt: '',
  }
}

export interface AgenticWorkflowCreationFlowProps extends PropsWithChildren {
  onExit: () => void
  // A template use case pre-fills part of the form and its variables when the
  // flow is entered with a `?template=` param (see agentic-workflow-templates.ts).
  seed?: Partial<AgenticWorkflowFormData>
  variablesSeed?: FlowVariableData['variables']
}

export function AgenticWorkflowCreationFlow({
  children,
  onExit,
  seed,
  variablesSeed,
}: AgenticWorkflowCreationFlowProps) {
  // useForm reads defaultValues once at mount, so freeze the seeded values to
  // stay stable even if the seed prop reference changes on a later re-render.
  const [defaultValues] = useState<AgenticWorkflowFormData>(() => ({ ...getAgenticWorkflowDefaults(), ...seed }))
  const [variablesDefaultValues] = useState<FlowVariableData>(() => ({
    variables: variablesSeed ?? [],
    externalSecrets: [],
  }))
  const variablesForm = useForm<FlowVariableData>({
    defaultValues: variablesDefaultValues,
    mode: 'onChange',
  })
  const form = useForm<AgenticWorkflowFormData>({
    defaultValues,
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

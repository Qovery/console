import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { type AgenticWorkflowAutomation, type AgenticWorkflowGitRepository } from '@qovery/domains/services/feature'

export interface AgenticWorkflowSettingsFormValues {
  name: string
  description: string
  enabled: boolean
  executionMode: AgenticWorkflowExecutionMode
  modelApiKey: string
  modelSettings: string
  agentPrompt: string
  repositories: AgenticWorkflowGitRepository[]
  mcpServerIds: string[]
  mcp: string
  dockerFragment: string
  automation: AgenticWorkflowAutomation
  hostAllowlist: string
  webhookIpAllowlist: string
  cpu: string
  ram: string
  gpu: string
  storage: string
}

import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { type AgenticWorkflowSettingsFormValues } from './agentic-workflow-settings.types'

export const SETTINGS_FORM_VALUES: AgenticWorkflowSettingsFormValues = {
  name: 'Incident assistant',
  description: 'Investigates production incidents',
  enabled: true,
  executionMode: AgenticWorkflowExecutionMode.IN_PLACE,
  modelApiKey: '',
  modelSettings: '{"provider":"anthropic"}',
  agentPrompt: 'Investigate the alert.',
  repositories: [],
  mcpServerIds: [],
  mcp: '',
  dockerFragment: '',
  automation: { id: 'automation', triggers: [{ id: 'webhook', type: 'webhook' }], outputs: [] },
  hostAllowlist: '*',
  webhookIpAllowlist: '10.0.0.0/8',
  cpu: '2000',
  ram: '2048',
  gpu: '0',
  storage: '10',
}

export function AgenticWorkflowSettingsFormHarness({
  children,
  values,
}: {
  children: (form: UseFormReturn<AgenticWorkflowSettingsFormValues>) => ReactNode
  values?: Partial<AgenticWorkflowSettingsFormValues>
}) {
  const form = useForm<AgenticWorkflowSettingsFormValues>({
    defaultValues: { ...SETTINGS_FORM_VALUES, ...values },
  })

  return children(form)
}

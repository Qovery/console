import {
  type AgenticWorkflowScheduleResponse,
  type AgenticWorkflowOutput as ApiAgenticWorkflowOutput,
} from 'qovery-typescript-axios'
import { type AgenticWorkflowAutomation, type AgenticWorkflowOutput } from './agentic-workflow-context'

function formatHeaders(headers: ApiAgenticWorkflowOutput['headers']) {
  return JSON.stringify(Object.fromEntries((headers ?? []).map(({ name, value }) => [name, value])), null, 2)
}

export function createAgenticWorkflowAutomation(
  schedule: AgenticWorkflowScheduleResponse | null | undefined,
  outputs: ApiAgenticWorkflowOutput[]
): AgenticWorkflowAutomation {
  return {
    id: 'automation',
    triggers: [
      { id: 'webhook', type: 'webhook' },
      ...(schedule
        ? [
            {
              id: 'schedule',
              type: 'schedule' as const,
              cronExpression: schedule.cron_expression,
              timezone: schedule.timezone,
            },
          ]
        : []),
    ],
    outputs: outputs.map(({ name, url, headers, instructions }) => ({
      name,
      url: url ?? null,
      headersJson: formatHeaders(headers),
      prompt: instructions ?? '',
    })),
  }
}

function parseHeaders(headersJson: string) {
  if (!headersJson.trim()) return []
  const headers = JSON.parse(headersJson) as Record<string, string>
  return Object.entries(headers).map(([name, value]) => ({ name, value }))
}

export function formatAgenticWorkflowAutomationOutputs(outputs: AgenticWorkflowOutput[]): ApiAgenticWorkflowOutput[] {
  return outputs.map(({ name, url, headersJson, prompt }, index) => {
    const headers = parseHeaders(headersJson)

    return {
      name: name?.trim() || `Output ${index + 1}`,
      url: url?.trim() || null,
      ...(headers.length ? { headers } : {}),
      ...(prompt ? { instructions: prompt } : {}),
    }
  })
}

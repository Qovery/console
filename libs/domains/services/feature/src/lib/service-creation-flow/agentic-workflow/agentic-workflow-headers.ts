import { type AgenticWorkflowHeader } from 'qovery-typescript-axios'

export function parseAgenticWorkflowHeaders(headersJson: string): AgenticWorkflowHeader[] {
  if (!headersJson.trim()) return []

  try {
    const parsedValue: unknown = JSON.parse(headersJson)

    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) return []

    return Object.entries(parsedValue)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([name, value]) => ({ name, value }))
  } catch {
    return []
  }
}

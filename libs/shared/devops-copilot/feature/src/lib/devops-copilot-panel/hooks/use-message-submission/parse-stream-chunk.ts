import type { PlanStep } from '../../devops-copilot-panel'

const CHUNK_PREFIXES = {
  PLAN: '__plan__:',
  STEP: '__step__:',
  STEP_PLAN: '__stepPlan__:',
  GENERATING_PLAN: '__stepPlan__:generating_a_new_plan',
} as const

export type ParsedChunkType = {
  type: 'start' | 'plan' | 'step' | 'step_plan' | 'step_plan_reset' | 'content'
  data?: {
    threadId?: string
    plan?: PlanStep[]
    loadingText?: string
    stepUpdate?: { description: string; status: string }
    content?: string
  }
}

export function parseStreamChunk(chunk: string, currentContent: string): ParsedChunkType | null {
  try {
    const parsed = JSON.parse(chunk)

    if (parsed.type === 'start' && parsed.content?.thread_id) {
      return { type: 'start', data: { threadId: parsed.content.thread_id } }
    }

    if (parsed.type === 'chunk' && parsed.content) {
      const { content } = parsed

      if (content.includes(CHUNK_PREFIXES.GENERATING_PLAN)) {
        return { type: 'step_plan_reset', data: { loadingText: 'Generating a new plan...' } }
      }

      if (content.includes(CHUNK_PREFIXES.PLAN)) {
        try {
          const planArray = JSON.parse(content.replace(CHUNK_PREFIXES.PLAN, ''))
          const plan = planArray.map((step: { description: string; tool_name: string }) => ({
            messageId: 'temp',
            description: step.description,
            toolName: step.tool_name,
            status: 'not_started' as const,
          }))
          return { type: 'plan', data: { plan } }
        } catch (e) {
          console.error('Failed to parse plan:', e)
          return null
        }
      }

      if (content.includes(CHUNK_PREFIXES.STEP_PLAN)) {
        try {
          const stepPlanContent = content.replace(CHUNK_PREFIXES.STEP_PLAN, '').trim()
          if (!stepPlanContent || !stepPlanContent.startsWith('{')) return null

          const stepObj = JSON.parse(stepPlanContent)
          const { description, status } = stepObj

          if (description && status) {
            return {
              type: 'step_plan',
              data: {
                stepUpdate: { description, status },
                loadingText: description.charAt(0).toUpperCase() + description.slice(1),
              },
            }
          }
        } catch (e) {
          console.error('Failed to parse stepPlan object:', e)
          return null
        }
      }

      if (content.includes(CHUNK_PREFIXES.STEP)) {
        const stepDescription = content.replace(CHUNK_PREFIXES.STEP, '').replaceAll('_', ' ')
        return {
          type: 'step',
          data: { loadingText: stepDescription.charAt(0).toUpperCase() + stepDescription.slice(1) },
        }
      }

      return { type: 'content', data: { content: currentContent + content } }
    }
  } catch (error) {
    console.error('Error parsing chunk:', error)
  }

  return null
}

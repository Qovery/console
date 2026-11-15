import { type SkillPresetFinding } from '../skill-presets.types'
import { type InspectedField } from './mock-content-inspector'

/*
 * Stand-in for the model security review that q-core runs on AWS Bedrock after its rules, for the
 * mock only. It knows two reworded shapes the rules miss, so the Console can show model findings.
 */

const SHAPES: { category: string; reason: string; pattern: RegExp }[] = [
  {
    category: 'data-exfiltration',
    reason: 'Asks the agent to send environment data to an outside address',
    pattern:
      /\b(share|send|post|forward|copy)\b[^.\n]{0,80}\b(env|environment|secrets?|tokens?|credentials?)\b[^.\n]{0,80}\b(with|to|at)\b/i,
  },
  {
    category: 'concealment',
    reason: 'Asks the agent to keep an action from the person it works for',
    pattern: /\b(no need to|don't bother to|keep it between)\b[^.\n]{0,40}\b(mention|tell|report|us)\b/i,
  },
]

/** A Bedrock inference profile id, as q-core records it. The Console shows a friendly name instead. */
export const MOCK_REVIEW_MODEL = 'us.anthropic.claude-haiku-4-5-20251001-v1:0'
export const MOCK_REVIEW_PROMPT_VERSION = 'v1'

export function reviewSkillPresetContent(fields: InspectedField[]): SkillPresetFinding[] {
  return fields.flatMap(({ location, text }) =>
    text.split('\n').flatMap((lineText, index) =>
      SHAPES.filter(({ pattern }) => pattern.test(lineText)).map(({ category, reason }) => ({
        source: 'MODEL' as const,
        rule_id: category,
        location,
        line: index + 1,
        reason,
      }))
    )
  )
}

import { type OrganizationEventResponse, type OrganizationEventResponseList } from 'qovery-typescript-axios'
import { type SkillLoadChange } from './skill-presets.types'

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

/** The `change` of a SKILL_LOAD or SKILL_VIEW audit entry, checked once here so the UI reads typed fields. */
export function isSkillLoadChange(value: unknown): value is SkillLoadChange {
  return (
    isRecord(value) &&
    typeof value['skill_name'] === 'string' &&
    typeof value['source'] === 'string' &&
    typeof value['from_cache'] === 'boolean'
  )
}

export function parseSkillLoadChange(change?: string | null): SkillLoadChange | null {
  if (!change) return null
  try {
    const parsed: unknown = JSON.parse(change)
    return isSkillLoadChange(parsed) ? parsed : null
  } catch {
    return null
  }
}

export interface SkillLoadRow {
  event: OrganizationEventResponse
  /** Null when the entry is not a skill load or its payload is unreadable. */
  load: SkillLoadChange | null
}

export interface SkillLoadPage {
  rows: SkillLoadRow[]
  nextToken: string | null
  previousToken: string | null
}

const tokenFrom = (link: string | undefined, name: string) =>
  link ? new URLSearchParams(link.split('?')[1]).get(name) : null

/** Use as a React Query `select`: parsed rows plus the cursors of the previous and next pages. */
export function toSkillLoadPage(response: OrganizationEventResponseList): SkillLoadPage {
  return {
    rows: (response.events ?? []).map((event) => ({ event, load: parseSkillLoadChange(event.change) })),
    nextToken: tokenFrom(response.links?.next, 'continueToken'),
    previousToken: tokenFrom(response.links?.previous, 'stepBackToken'),
  }
}

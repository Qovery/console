import { OrganizationEventType } from 'qovery-typescript-axios'
import { AUDIT_LOG_EVENT_TYPES, auditLogsParamsSchema } from './audit-logs-search-params'

describe('auditLogsParamsSchema', () => {
  it.each(['SKILL_LOAD', 'SKILL_VIEW', 'SKILL_PRESET_REJECTED'])(
    'accepts the %s event type before the generated enum includes it',
    (eventType) => {
      expect(auditLogsParamsSchema.parse({ eventType }).eventType).toBe(eventType)
      expect(AUDIT_LOG_EVENT_TYPES).toContain(eventType)
    }
  )

  it('keeps every generated event type', () => {
    expect(AUDIT_LOG_EVENT_TYPES).toEqual(expect.arrayContaining(Object.values(OrganizationEventType)))
    expect(auditLogsParamsSchema.parse({ eventType: OrganizationEventType.DEPLOYED }).eventType).toBe('DEPLOYED')
  })

  it('rejects an unknown event type', () => {
    expect(auditLogsParamsSchema.safeParse({ eventType: 'NOT_AN_EVENT' }).success).toBe(false)
  })
})

import { OrganizationEventType } from 'qovery-typescript-axios'
import { AUDIT_LOG_EVENT_TYPES, auditLogsParamsSchema } from './audit-logs-search-params'

describe('auditLogsParamsSchema', () => {
  it('accepts skill load events, which the generated enum does not list yet', () => {
    expect(auditLogsParamsSchema.parse({ eventType: 'SKILL_LOAD' }).eventType).toBe('SKILL_LOAD')
    expect(AUDIT_LOG_EVENT_TYPES).toContain('SKILL_LOAD')
  })

  it('keeps every generated event type', () => {
    expect(AUDIT_LOG_EVENT_TYPES).toEqual(expect.arrayContaining(Object.values(OrganizationEventType)))
    expect(auditLogsParamsSchema.parse({ eventType: OrganizationEventType.DEPLOYED }).eventType).toBe('DEPLOYED')
  })

  it('rejects an unknown event type', () => {
    expect(auditLogsParamsSchema.safeParse({ eventType: 'NOT_AN_EVENT' }).success).toBe(false)
  })
})

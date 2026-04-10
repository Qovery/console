import {
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { z } from 'zod'

export const DEFAULT_PAGE_SIZE = 30

export const auditLogsParamsSchema = z.object({
  pageSize: z.number().optional().catch(DEFAULT_PAGE_SIZE),
  origin: z.enum(Object.values(OrganizationEventOrigin)).optional(),
  subTargetType: z.enum(Object.values(OrganizationEventSubTargetType)).optional(),
  triggeredBy: z.string().optional(),
  targetId: z.string().optional(),
  targetType: z.enum(Object.values(OrganizationEventTargetType)).optional(),
  eventType: z.enum(Object.values(OrganizationEventType)).optional(),
  toTimestamp: z.string().optional(),
  fromTimestamp: z.string().optional(),
  continueToken: z.string().optional(),
  stepBackToken: z.string().optional(),
  projectId: z.string().optional(),
  environmentId: z.string().optional(),
})

export type AuditLogsParams = z.infer<typeof auditLogsParamsSchema>

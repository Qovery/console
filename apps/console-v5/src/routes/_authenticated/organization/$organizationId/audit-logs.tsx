import { createFileRoute } from '@tanstack/react-router'
import {
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { z } from 'zod'
import { AuditLogsFeature, DEFAULT_PAGE_SIZE } from '@qovery/domains/audit-logs/feature'

export const auditLogsSearchSchema = z.object({
  pageSize: z.number().catch(DEFAULT_PAGE_SIZE),
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

export type AuditLogsSearch = z.infer<typeof auditLogsSearchSchema>

export const Route = createFileRoute('/_authenticated/organization/$organizationId/audit-logs')({
  component: RouteComponent,
  validateSearch: auditLogsSearchSchema,
})

function RouteComponent() {
  // Test
  const params = Route.useSearch()
  console.log('params', params)

  return <AuditLogsFeature />
}

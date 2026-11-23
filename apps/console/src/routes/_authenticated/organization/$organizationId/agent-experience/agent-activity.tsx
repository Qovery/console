import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AgentActivity } from '@qovery/domains/skill-presets/feature'

// The Activity filters, so a filtered view can be linked to and shared.
const searchSchema = z.object({
  range: z.string().optional(),
  actor: z.string().optional(),
  skill: z.string().optional(),
  outcome: z.enum(['ALLOWED', 'DENIED']).optional().catch(undefined),
  via: z
    .enum(['SKILL_LOAD', 'SKILL_API_ACTION', 'MCP_TOOL_CALL', 'POLICY_DENIAL', 'POLICY_TOKEN_API_ACTION'])
    .optional()
    .catch(undefined),
  view: z.enum(['member', 'token', 'skill']).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/agent-activity')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentActivity />
}

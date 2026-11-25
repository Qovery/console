import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SkillPresetCreate } from '@qovery/domains/skill-presets/feature'

const searchSchema = z.object({
  template: z.string().optional(),
  from: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/skill-presets/new')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return <SkillPresetCreate />
}

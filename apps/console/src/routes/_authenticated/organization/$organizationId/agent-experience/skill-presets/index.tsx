import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SettingsSkillPresets } from '@qovery/domains/skill-presets/feature'

// `connect` opens the Connect an agent popup: old Connect links land here.
const searchSchema = z.object({ connect: z.boolean().optional() })

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/skill-presets/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsSkillPresets />
}

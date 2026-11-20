import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  template: z.string().optional(),
  from: z.string().optional(),
})

// Moved to Agents. Kept so old links and bookmarks still work.
export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/skill-presets/new')({
  validateSearch: searchSchema,
  beforeLoad: ({ params: { organizationId }, search }) => {
    throw redirect({
      to: '/organization/$organizationId/agent-experience/skill-presets/new',
      params: { organizationId },
      search,
      replace: true,
    })
  },
})

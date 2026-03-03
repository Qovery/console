import { z } from 'zod'

export const serviceOverviewParamsSchema = z.object({
  hasShell: z.boolean().optional(),
})

export type ServiceParams = z.infer<typeof serviceOverviewParamsSchema>

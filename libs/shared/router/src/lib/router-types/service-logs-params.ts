import { z } from 'zod'

export const serviceLogsParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  instance: z.string().optional(),
  container: z.string().optional(),
  version: z.string().optional(),
  message: z.string().optional(),
  level: z.string().optional(),
  search: z.string().optional(),
  nginx: z.boolean().optional(),
  envoy: z.boolean().optional(),
  deploymentId: z.string().optional(),
  mode: z.string().optional(),
})

export type ServiceLogsParams = z.infer<typeof serviceLogsParamsSchema>

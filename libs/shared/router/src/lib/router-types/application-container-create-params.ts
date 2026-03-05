import { z } from 'zod'

const applicationContainerCreateSourceEnum = z.enum(['application', 'container'])

export const applicationContainerCreateParamsSchema = z.object({
  source: applicationContainerCreateSourceEnum.optional(),
  template: z.string().optional(),
  option: z.string().optional(),
})

export type ApplicationContainerCreateParams = z.infer<typeof applicationContainerCreateParamsSchema>

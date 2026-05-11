import { z } from 'zod'

const serviceCreateSourceEnum = z.enum(['application', 'container'])

export const serviceCreateParamsSchema = z.object({
  source: serviceCreateSourceEnum.optional(),
  template: z.string().optional(),
  option: z.string().optional(),
})

export type ServiceCreateParams = z.infer<typeof serviceCreateParamsSchema>

export const applicationContainerCreateParamsSchema = serviceCreateParamsSchema
export type ApplicationContainerCreateParams = ServiceCreateParams

import { z } from 'zod'

const serviceCreateSourceEnum = z.enum(['application', 'container'])
const serviceCreateSectionEnum = z.enum(['service-information', 'blueprint-setup', 'overrides'])

export type ServiceCreateSection = z.infer<typeof serviceCreateSectionEnum>

export const serviceCreateParamsSchema = z.object({
  source: serviceCreateSourceEnum.optional(),
  template: z.string().optional(),
  option: z.string().optional(),
  // Used by blueprint service creation to reopen a specific configuration section from the summary.
  section: serviceCreateSectionEnum.optional(),
})

export type ServiceCreateParams = z.infer<typeof serviceCreateParamsSchema>

export const applicationContainerCreateParamsSchema = serviceCreateParamsSchema
export type ApplicationContainerCreateParams = ServiceCreateParams

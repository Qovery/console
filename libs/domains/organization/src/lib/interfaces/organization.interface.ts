import { PlanEnum } from '@console/shared/enums'

export interface OrganizationInterface {
  name: string
  plan: PlanEnum
  id?: string
  created_at?: Date
  updated_at?: Date
  description?: string
  website_url?: string
  repository?: string
  logo_url?: string
  icon_url?: string
  owner?: string
}

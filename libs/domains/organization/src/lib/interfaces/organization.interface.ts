import { OrganizationPlanType } from '../enums'

export interface OrganizationInterface {
  name: string
  plan: OrganizationPlanType
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

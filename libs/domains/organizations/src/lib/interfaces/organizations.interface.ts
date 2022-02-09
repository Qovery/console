import { OrganizationPlanType } from '../enums/organizations.enum'

export interface OrganizationInterface {
  id: string
  created_at: Date
  updated_at: Date
  name: string
  description: string
  plan: OrganizationPlanType
  website_url: string
  repository: string
  logo_url: string
  icon_url: string
  owner: string
}

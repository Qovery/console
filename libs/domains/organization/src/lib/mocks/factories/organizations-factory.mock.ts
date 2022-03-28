import { Chance } from 'chance'
import { OrganizationInterface } from '../../interfaces/organization.interface'

const chance = new Chance()

export const organizationFactoryMock = (howMany: number): OrganizationInterface[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date(),
    updated_at: new Date(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    plan: chance.pickone(Object.values(OrganizationPlanType)),
    website_url: chance.url(),
    repository: chance.name(),
    logo_url: chance.url(),
    icon_url: chance.url(),
    owner: chance.name(),
  }))

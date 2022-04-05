import { Chance } from 'chance'
import { OrganizationResponsePlanEnum } from 'qovery-typescript-axios'
// import { OrganizationPlanType } from '../../enums'
import { OrganizationInterface } from '../../interfaces'

const chance = new Chance()

export const organizationFactoryMock = (howMany: number): OrganizationInterface[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    plan: chance.pickone(Object.values([OrganizationResponsePlanEnum.FREE])),
    website_url: chance.url(),
    repository: chance.name(),
    logo_url: chance.url(),
    icon_url: chance.url(),
    owner: chance.name(),
  }))

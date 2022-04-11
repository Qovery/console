import { Chance } from 'chance'
import { Organization, PlanEnum } from "qovery-typescript-axios";

const chance = new Chance()

export const organizationFactoryMock = (howMany: number): Organization[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    plan: chance.pickone(Object.values([PlanEnum.FREE])),
    website_url: chance.url(),
    repository: chance.name(),
    logo_url: chance.url(),
    icon_url: chance.url(),
    owner: chance.name(),
  }))

import { Chance } from 'chance'
import { ContainerRegistryKindEnum, ContainerRegistryResponse, PlanEnum } from 'qovery-typescript-axios'
import { OrganizationEntity } from '@qovery/shared/interfaces'

const chance = new Chance()

export const organizationFactoryMock = (howMany: number): OrganizationEntity[] =>
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
    admin_emails: ['test@test.com'],
    containerRegistries: {
      loadingStatus: 'loaded',
      items: containerRegistriesMock(2),
    },
  }))

export const containerRegistriesMock = (howMany: number): ContainerRegistryResponse[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    kind: chance.pickone(Object.values([ContainerRegistryKindEnum.DOCKER_HUB])),
    description: chance.word({ length: 10 }),
    url: chance.url(),
  }))

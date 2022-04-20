import { Chance } from 'chance'
import { Environment, EnvironmentModeEnum } from 'qovery-typescript-axios'

const chance = new Chance()

export const environmentFactoryMock = (howMany: number): Environment[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    last_updated_by: new Date().toString(),
    cloud_provider: {
      provider: chance.name(),
      cluster: chance.name(),
    },
    mode: chance.pickone(Object.values([EnvironmentModeEnum.DEVELOPMENT])),
    cluster_id: chance.guid(),
  }))

import { Chance } from 'chance'
import {
  Environment,
  Status,
  EnvironmentModeEnum,
  GlobalDeploymentStatus,
  ServiceDeploymentStatusEnum,
} from 'qovery-typescript-axios'

const chance = new Chance()

type Environments = Environment & { status?: Status }

export const environmentFactoryMock = (howMany: number): Environments[] =>
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
    status: {
      id: `${index}`,
      state: chance.pickone(Object.values([GlobalDeploymentStatus.DEPLOYED])),
      message: chance.word({ length: 10 }),
      service_deployment_status: chance.pickone(Object.values([ServiceDeploymentStatusEnum.UP_TO_DATE])),
    },
  }))

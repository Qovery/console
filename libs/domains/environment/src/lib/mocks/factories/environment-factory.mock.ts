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
    created_at: chance.date().toString(),
    updated_at: chance.date().toString(),
    name: chance.name(),
    last_updated_by: chance.date().toString(),
    cloud_provider: {
      provider: chance.name(),
      cluster: chance.name(),
    },
    mode: chance.pickone(
      Object.values([EnvironmentModeEnum.DEVELOPMENT, EnvironmentModeEnum.PRODUCTION, EnvironmentModeEnum.STAGING])
    ),
    cluster_id: chance.guid(),
    status: {
      id: `${index}`,
      state: chance.pickone(
        Object.values([
          GlobalDeploymentStatus.DEPLOYED,
          GlobalDeploymentStatus.RUNNING,
          GlobalDeploymentStatus.STOP_ERROR,
        ])
      ),
      message: chance.word({ length: 10 }),
      service_deployment_status: chance.pickone(Object.values([ServiceDeploymentStatusEnum.UP_TO_DATE])),
    },
  }))

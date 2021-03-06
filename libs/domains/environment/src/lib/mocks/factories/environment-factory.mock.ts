import { Chance } from 'chance'
import {
  DeploymentHistoryStatusEnum,
  EnvironmentModeEnum,
  ServiceDeploymentStatusEnum,
  StateEnum,
} from 'qovery-typescript-axios'
import { EnvironmentEntity } from '@console/shared/interfaces'

const chance = new Chance()

type Environments = EnvironmentEntity

const service = {
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  name: chance.name(),
  status: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.RUNNING, StateEnum.STOP_ERROR])),
}

const database = {
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  name: chance.name(),
  status: chance.pickone(Object.values([DeploymentHistoryStatusEnum.SUCCESS, DeploymentHistoryStatusEnum.FAILED])),
}

const deployment = {
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  status: StateEnum.DEPLOYED,
  applications: [service, service, service],
  databases: [database, database, database],
}

export const environmentFactoryMock = (howMany: number, noStatus = false, noDeployments = false): Environments[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${(index + 1) * Math.random()}`,
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
    status: !noStatus
      ? {
          id: `${index}`,
          state: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.RUNNING, StateEnum.STOP_ERROR])),
          message: chance.word({ length: 10 }),
          service_deployment_status: chance.pickone(Object.values([ServiceDeploymentStatusEnum.UP_TO_DATE])),
        }
      : undefined,
    deployments: !noDeployments ? [deployment, deployment, deployment] : undefined,
  }))

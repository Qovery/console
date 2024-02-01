import { Chance } from 'chance'
import {
  type DeploymentHistoryEnvironment,
  type Environment,
  EnvironmentModeEnum,
  ServiceDeploymentStatusEnum,
  StateEnum,
  WeekdayEnum,
} from 'qovery-typescript-axios'

const chance = new Chance('123')

const service = {
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  name: chance.name(),
  status: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.STOP_ERROR])),
}

const database = {
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  name: chance.name(),
  status: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.STOP_ERROR])),
}

export const deploymentMock: DeploymentHistoryEnvironment = {
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  status: StateEnum.DEPLOYED,
  applications: [service, service, service],
  databases: [database, database, database],
}

const deploymentRules = {
  id: chance.guid(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  auto_stop: true,
  auto_preview: true,
  timezone: 'UTC',
  start_time: chance.date().toString(),
  stop_time: chance.date().toString(),
  weekdays: [chance.pickone(Object.values(WeekdayEnum))],
}

export const environmentFactoryMock = (howMany: number, noStatus = false, noDeployments = false): Environment[] => {
  const ids = chance.unique(chance.integer, howMany, { min: 0 })
  return Array.from({ length: howMany }).map((_, index) => ({
    id: `${ids[index]}`,
    project: { id: '123' },
    organization: {
      id: '123',
    },
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
          state: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.STOP_ERROR])),
          message: chance.word({ length: 10 }),
          service_deployment_status: chance.pickone(Object.values([ServiceDeploymentStatusEnum.UP_TO_DATE])),
        }
      : undefined,
    deployments: !noDeployments ? [deploymentMock, deploymentMock, deploymentMock] : undefined,
    deploymentRules: deploymentRules,
  }))
}

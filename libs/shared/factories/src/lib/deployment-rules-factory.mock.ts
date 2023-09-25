import { Chance } from 'chance'
import { EnvironmentModeEnum, type ProjectDeploymentRule } from 'qovery-typescript-axios'

const chance = new Chance('123')

export const deploymentRulesFactoryMock = (howMany: number): ProjectDeploymentRule[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    mode: chance.pickone(Object.values([EnvironmentModeEnum.DEVELOPMENT])),
    cluster_id: chance.guid(),
    auto_stop: false,
    timezone: 'UTC',
    start_time: new Date().toString(),
    stop_time: new Date().toString(),
    wildcard: '',
    priority_index: index,
    weekdays: [],
  }))

import { Chance } from 'chance'
import { type DeploymentHistoryDatabase, StateEnum } from 'qovery-typescript-axios'

const chance = new Chance('123')

export const databaseDeploymentsFactoryMock = (howMany: number): DeploymentHistoryDatabase[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: index.toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    status: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.READY])),
  }))

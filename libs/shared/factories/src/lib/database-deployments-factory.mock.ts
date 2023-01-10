import { Chance } from 'chance'
import { DeploymentHistoryDatabase, DeploymentHistoryStatusEnum } from 'qovery-typescript-axios'

const chance = new Chance()

export const databaseDeploymentsFactoryMock = (howMany: number): DeploymentHistoryDatabase[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: index.toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    status: chance.pickone(Object.values([DeploymentHistoryStatusEnum.SUCCESS, DeploymentHistoryStatusEnum.FAILED])),
  }))

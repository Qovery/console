import { Chance } from 'chance'
import { DeploymentHistoryApplication, StateEnum } from 'qovery-typescript-axios'

const chance = new Chance()

export const applicationDeploymentsFactoryMock = (howMany: number): DeploymentHistoryApplication[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: index.toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    status: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.RUNNING, StateEnum.STOP_ERROR])),
  }))

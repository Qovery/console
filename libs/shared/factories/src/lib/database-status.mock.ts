import { Chance } from 'chance'
import { ServiceDeploymentStatusEnum, StateEnum, type Status } from 'qovery-typescript-axios'

const chance = new Chance('123')

export const databaseStatusFactoryMock = (howMany: number): Status[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    message: chance.sentence(),
    service_deployment_status: chance.pickone(
      Object.values([
        ServiceDeploymentStatusEnum.UP_TO_DATE,
        ServiceDeploymentStatusEnum.UP_TO_DATE,
        ServiceDeploymentStatusEnum.UP_TO_DATE,
      ])
    ),
    state: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.STOP_ERROR])),
  }))

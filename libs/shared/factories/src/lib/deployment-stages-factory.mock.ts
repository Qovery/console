import { Chance } from 'chance'
import { DeploymentStageResponse } from 'qovery-typescript-axios'

const chance = new Chance()

export const deploymentStagesFactoryMock = (howMany: number): DeploymentStageResponse[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: index.toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    environment: {
      id: '1',
    },
    name: chance.name(),
    description: chance.word({ length: 10 }),
    deployment_order: 0,
    services: [
      {
        id: index.toString(),
        created_at: new Date().toString(),
        updated_at: new Date().toString(),
        service_id: '0',
        service_type: 'DOCKER',
      },
    ],
  }))

import { Chance } from 'chance'
import { CloudProviderEnum, StateEnum } from 'qovery-typescript-axios'
import { ClusterEntity } from '@qovery/shared/interfaces'

const chance = new Chance()

export const clusterFactoryMock = (howMany: number): ClusterEntity[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    region: chance.name(),
    cloud_provider: chance.pickone(Object.values(CloudProviderEnum)),
    min_running_nodes: 1,
    max_running_nodes: 5,
    disk_size: 10,
    status: chance.pickone(Object.values(StateEnum)),
    is_default: false,
    version: '1.22',
    instance_type: chance.name(),
    extendedStatus: {
      loadingStatus: 'loaded',
      status: {
        id: index,
        last_execution_id: chance.name(),
        is_deployed: true,
        status: chance.pickone(Object.values(StateEnum)),
      },
    },
  }))

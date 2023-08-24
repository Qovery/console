import { Chance } from 'chance'
import { PortProtocolEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { ContainerApplicationEntity } from '@qovery/shared/interfaces'

const chance = new Chance('123')

export const containerFactoryMock = (howMany: number): ContainerApplicationEntity[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: index.toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    cpu: 1000,
    memory: 1024,
    min_running_instances: 1,
    max_running_instances: 3,
    auto_preview: false,
    maximum_cpu: 10,
    maximum_memory: 10,
    image_name: chance.word({ length: 10 }),
    updated_at: new Date().toString(),
    storage: [
      {
        id: chance.guid(),
        type: chance.pickone(Object.values([StorageTypeEnum.FAST_SSD])),
        size: 10,
        mount_point: '',
      },
    ],
    ports: [
      {
        id: chance.guid(),
        name: chance.name(),
        internal_port: 80,
        external_port: 80,
        publicly_accessible: true,
        protocol: chance.pickone(Object.values([PortProtocolEnum.HTTP])),
        is_default: true,
      },
    ],
    environment: {
      id: chance.guid(),
    },
    created_at: new Date().toString(),
    links: {
      loadingStatus: 'loaded',
      items: [],
    },
    tag: chance.word({ length: 10 }),
    registry: {
      id: chance.guid(),
    },
    deployments: {
      loadingStatus: 'loaded',
      items: [],
    },
    instances: {
      loadingStatus: 'loaded',
      items: [],
    },
  }))

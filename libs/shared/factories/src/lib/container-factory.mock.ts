import { Chance } from 'chance'
import { ContainerRegistryKindEnum, PortProtocolEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { type Container } from '@qovery/domains/services/data-access'

const chance = new Chance('123')

export const containerFactoryMock = (howMany: number): Container[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: index.toString(),
    service_type: 'CONTAINER',
    icon_uri: 'app://qovery-console/container',
    name: chance.name(),
    description: chance.word({ length: 10 }),
    serviceType: 'CONTAINER' as const,
    cpu: 1000,
    memory: 1024,
    gpu: 0,
    min_running_instances: 1,
    max_running_instances: 3,
    auto_preview: false,
    maximum_cpu: 10,
    maximum_memory: 10,
    maximum_gpu: 0,
    image_name: chance.word({ length: 10 }),
    image_entry_point: chance.word({ length: 10 }),
    updated_at: '2022-08-10T14:55:21.382762Z',
    healthchecks: {},
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
    created_at: '2022-06-10T14:55:21.382761Z',
    links: {
      loadingStatus: 'loaded',
      items: [],
    },
    tag: chance.word({ length: 10 }),
    registry: {
      id: chance.guid(),
      name: chance.name(),
      url: chance.url(),
      kind: chance.pickone(Object.values(ContainerRegistryKindEnum)),
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

export const gitContainerFactoryMock = (howMany: number): Container[] =>
  containerFactoryMock(howMany).map((container) => ({
    ...container,
    auto_deploy: false,
    auto_preview: false,
    source: {
      git_repository: {
        provider: 'GITHUB' as const,
        owner: 'qovery',
        name: 'qovery/console',
        url: 'https://github.com/qovery/console.git',
        branch: 'main',
        root_path: '/',
        deployed_commit_id: '4f3a1c2e9b8d7a6f5e4d3c2b1a0f9e8d7c6b5a49',
        dockerfile_path: 'Dockerfile',
      },
    },
    build_settings: {},
  }))

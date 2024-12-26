import { Chance } from 'chance'
import { BuildModeEnum, PortProtocolEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { type Application } from '@qovery/domains/services/data-access'

const chance = new Chance('123')

export const applicationFactoryMock = (howMany: number): Application[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    service_type: 'APPLICATION',
    icon_uri: 'app://qovery-console/application',
    created_at: chance.date({ year: 2023, string: true }).toString(),
    updated_at: chance.date({ year: 2024, string: true }).toString(),
    serviceType: 'APPLICATION' as const,
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
      },
    ],
    environment: {
      id: chance.guid(),
    },
    maximum_cpu: 10,
    maximum_memory: 10,
    name: chance.name(),
    description: chance.word({ length: 10 }),
    build_mode: chance.pickone(Object.values([BuildModeEnum.DOCKER])),
    dockerfile_path: chance.word({ length: 5 }),
    cpu: 1000,
    memory: 1024,
    min_running_instances: 1,
    max_running_instances: 3,
    auto_preview: false,
    healthchecks: {},
    annotations_groups: [],
    labels_groups: [],
    git_repository: {
      id: chance.guid(),
      url: chance.url(),
      provider: 'GITHUB',
      owner: chance.name(),
      name: chance.name(),
      branch: chance.word({ length: 5 }),
      root_path: chance.word({ length: 5 }),
      git_token_id: chance.guid(),
    },
  }))

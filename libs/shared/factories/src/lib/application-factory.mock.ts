import { Chance } from 'chance'
import { BuildModeEnum, BuildPackLanguageEnum, PortProtocolEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { ApplicationEntity } from '@qovery/shared/interfaces'

const chance = new Chance()

export const applicationFactoryMock = (howMany: number): ApplicationEntity[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
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
    buildpack_language: chance.pickone(Object.values([BuildPackLanguageEnum.NODE_JS])),
    cpu: 1000,
    memory: 1024,
    min_running_instances: 1,
    max_running_instances: 3,
    auto_preview: false,
  }))

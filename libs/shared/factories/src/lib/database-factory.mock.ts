import { Chance } from 'chance'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { DatabaseEntity } from '@qovery/shared/interfaces'

const chance = new Chance()

export const databaseFactoryMock = (howMany: number): DatabaseEntity[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    type: DatabaseTypeEnum.POSTGRESQL,
    version: '12',
    mode: DatabaseModeEnum.CONTAINER,
    accessibility: DatabaseAccessibilityEnum.PRIVATE,
    cpu: 1,
    memory: 1024,
    storage: 1024,
    environment: {
      id: chance.guid(),
    },
    host: chance.name(),
    port: 80,
    maximum_cpu: 5012,
    maximum_memory: 5012,
    disk_encrypted: false,
  }))

import { Chance } from 'chance'
import { Database, DatabaseTypeEnum, DatabaseModeEnum, DatabaseAccessibilityEnum } from 'qovery-typescript-axios'

const chance = new Chance()

export const databaseFactoryMock = (howMany: number): Database[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    type: DatabaseTypeEnum.POSTGRESQL,
    version: '12',
    mode: DatabaseModeEnum.CONTAINER,
    accessibility: DatabaseAccessibilityEnum.PRIVATE,
    cpu: 1000,
    memory: 1024,
    storage: 1024,
    environment: {
      id: chance.guid(),
    },
    host: chance.name(),
    port: 80,
    maximum_cpu: 10,
    maximum_memory: 10,
    disk_encrypted: false,
  }))

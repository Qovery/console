import { Chance } from 'chance'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type Database } from '@qovery/domains/services/data-access'

const chance = new Chance('123')

export const databaseFactoryMock = (howMany: number, mode = DatabaseModeEnum.CONTAINER): Database[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    service_type: 'DATABASE',
    icon_uri: 'app://qovery-console/database',
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    serviceType: 'DATABASE' as const,
    name: chance.name(),
    type: DatabaseTypeEnum.POSTGRESQL,
    version: '12',
    mode: mode,
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
    instance_type: 't2.micro',
  }))

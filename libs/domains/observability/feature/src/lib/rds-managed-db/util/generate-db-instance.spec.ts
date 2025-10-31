import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { type Database } from '@qovery/domains/services/data-access'
import { generateDbInstance } from './generate-db-instance'

describe('generateDbInstance', () => {
  it('should generate correct db instance for PostgreSQL', () => {
    const service: Database = {
      id: 'b4b3b048-9605-4ca5-9518-8cd2df85f734',
      type: 'POSTGRESQL',
      mode: DatabaseModeEnum.MANAGED,
    } as Database

    const result = generateDbInstance(service)
    expect(result).toBe('zb4b3b048-postgresql')
  })

  it('should generate correct db instance for MySQL', () => {
    const service: Database = {
      id: 'a1a2a3a4-5678-1234-5678-1234567890ab',
      type: 'MYSQL',
      mode: DatabaseModeEnum.MANAGED,
    } as Database

    const result = generateDbInstance(service)
    expect(result).toBe('za1a2a3a4-mysql')
  })

  it('should generate correct db instance for Redis', () => {
    const service: Database = {
      id: 'c5c6c7c8-9101-1121-3141-516171819202',
      type: 'REDIS',
      mode: DatabaseModeEnum.MANAGED,
    } as Database

    const result = generateDbInstance(service)
    expect(result).toBe('zc5c6c7c8-redis')
  })

  it('should handle different ID formats', () => {
    const service: Database = {
      id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx',
      type: 'POSTGRESQL',
      mode: DatabaseModeEnum.MANAGED,
    } as Database

    const result = generateDbInstance(service)
    expect(result).toBe('z12345678-postgresql')
  })
})

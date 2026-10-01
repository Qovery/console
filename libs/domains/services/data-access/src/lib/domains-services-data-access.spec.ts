import { DatabaseTypeEnum } from 'qovery-typescript-axios'
import {
  type Database,
  type Terraform,
  isServiceMYSQL,
  isServicePostgreSQL,
  isTerraform,
} from './domains-services-data-access'

describe('service type guards', () => {
  // Shared factories depend on this library, so these fixtures contain only the fields read by the guards.
  const postgresql = { service_type: 'DATABASE', type: DatabaseTypeEnum.POSTGRESQL } as Database
  const mysql = { ...postgresql, type: DatabaseTypeEnum.MYSQL }
  const terraform = { service_type: 'TERRAFORM' } as Terraform

  it('identifies Terraform services', () => {
    expect(isTerraform(terraform)).toBe(true)
    expect(isTerraform(postgresql)).toBe(false)
  })

  it('identifies PostgreSQL databases only', () => {
    expect(isServicePostgreSQL(postgresql)).toBe(true)
    expect(isServicePostgreSQL(mysql)).toBe(false)
    expect(isServicePostgreSQL(terraform)).toBe(false)
  })

  it('identifies MySQL databases only', () => {
    expect(isServiceMYSQL(mysql)).toBe(true)
    expect(isServiceMYSQL(postgresql)).toBe(false)
    expect(isServiceMYSQL(terraform)).toBe(false)
  })
})

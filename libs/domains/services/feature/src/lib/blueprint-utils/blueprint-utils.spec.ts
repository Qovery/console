import { type BlueprintDetailsResponse, type BlueprintItem } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  OTHER_BLUEPRINT_CATEGORY,
  formatBlueprintName,
  getBlueprintDisplayName,
  getBlueprintPrimaryCategory,
  getRdsBlueprintEngine,
  isBlueprintCompatibleWithCluster,
} from './blueprint-utils'

describe('formatBlueprintName', () => {
  it.each([
    ['aws-rds-mysql', 'AWS RDS MySQL'],
    ['scaleway-managed-postgresql', 'Scaleway Managed PostgreSQL'],
    ['AWS S3 Bucket', 'AWS S3 Bucket'],
  ])('formats %s as %s', (name, expectedName) => {
    expect(formatBlueprintName(name)).toBe(expectedName)
  })
})

describe('getRdsBlueprintEngine', () => {
  const service = {
    id: 'service-1',
    service_type: 'TERRAFORM',
    blueprint_id: 'blueprint-1',
  } as AnyService
  const blueprint = {
    id: 'blueprint-1',
    service_id: 'service-1',
    service_type: 'TERRAFORM',
    catalog_url: 'https://github.com/Qovery/service-catalog.git',
    tag: 'aws/mysql/8/3.2.0',
  } as BlueprintDetailsResponse

  it('recognizes MySQL and PostgreSQL RDS catalog blueprints', () => {
    expect(getRdsBlueprintEngine(service, blueprint)).toBe('MYSQL')
    expect(getRdsBlueprintEngine(service, { ...blueprint, tag: 'AWS/postgres/17/3.2.0' })).toBe('POSTGRESQL')
  })

  it('rejects other blueprint families and providers', () => {
    expect(getRdsBlueprintEngine(service, { ...blueprint, tag: 'AWS/s3/1/3.2.0' })).toBeUndefined()
    expect(getRdsBlueprintEngine(service, { ...blueprint, tag: 'GCP/mysql/8/3.2.0' })).toBeUndefined()
    expect(getRdsBlueprintEngine(service, { ...blueprint, tag: 'AWS/mysql/8' })).toBeUndefined()
    expect(getRdsBlueprintEngine(service, { ...blueprint, tag: 'aws/mysql//3.2.0' })).toBeUndefined()
  })

  it('rejects unrelated services and catalogs', () => {
    expect(getRdsBlueprintEngine(service, { ...blueprint, service_id: 'another-service' })).toBeUndefined()
    expect(
      getRdsBlueprintEngine(service, { ...blueprint, catalog_url: 'https://github.com/other/catalog' })
    ).toBeUndefined()
    expect(getRdsBlueprintEngine({ ...service, service_type: 'HELM' } as AnyService, blueprint)).toBeUndefined()
    expect(
      getRdsBlueprintEngine({ id: service.id, service_type: 'TERRAFORM' } as AnyService, blueprint)
    ).toBeUndefined()
    expect(getRdsBlueprintEngine(undefined, blueprint)).toBeUndefined()
    expect(getRdsBlueprintEngine(service, undefined)).toBeUndefined()
  })
})

describe('getBlueprintDisplayName', () => {
  const blueprint = {
    name: 'aws-rds-mysql',
  } as BlueprintItem

  it('prefers the catalog display name', () => {
    expect(getBlueprintDisplayName({ ...blueprint, displayName: 'Amazon RDS for MySQL' } as BlueprintItem)).toBe(
      'Amazon RDS for MySQL'
    )
  })

  it('formats the catalog name when the display name is missing', () => {
    expect(getBlueprintDisplayName(blueprint)).toBe('AWS RDS MySQL')
  })
})

describe('getBlueprintPrimaryCategory', () => {
  const blueprint = {
    name: 'aws-s3',
  } as BlueprintItem

  it('returns the catalog category', () => {
    expect(getBlueprintPrimaryCategory({ ...blueprint, primaryCategory: 'Storage' } as BlueprintItem)).toBe('Storage')
  })

  it('falls back for catalog entries without a category', () => {
    expect(getBlueprintPrimaryCategory(blueprint)).toBe(OTHER_BLUEPRINT_CATEGORY)
  })
})

describe('isBlueprintCompatibleWithCluster', () => {
  it.each([
    ['AWS', 'AWS', true],
    ['SCW', 'AWS', false],
    ['EXTERNAL', 'AWS', true],
    ['HELM', 'AWS', true],
    ['SCW', undefined, true],
  ])('returns %s for a %s cluster as %s', (blueprintProvider, clusterCloudProvider, expected) => {
    expect(isBlueprintCompatibleWithCluster(blueprintProvider, clusterCloudProvider)).toBe(expected)
  })
})

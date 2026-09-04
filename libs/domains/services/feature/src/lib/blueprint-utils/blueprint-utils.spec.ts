import type { BlueprintItem } from 'qovery-typescript-axios'
import {
  formatBlueprintName,
  getBlueprintDisplayName,
  getBlueprintPrimaryCategory,
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
    expect(getBlueprintPrimaryCategory(blueprint)).toBe('Other')
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

import { formatBlueprintName, isBlueprintCompatibleWithCluster } from './blueprint-utils'

describe('formatBlueprintName', () => {
  it.each([
    ['aws-rds-mysql', 'AWS RDS MySQL'],
    ['scaleway-managed-postgresql', 'Scaleway Managed PostgreSQL'],
    ['AWS S3 Bucket', 'AWS S3 Bucket'],
  ])('formats %s as %s', (name, expectedName) => {
    expect(formatBlueprintName(name)).toBe(expectedName)
  })
})

describe('isBlueprintCompatibleWithCluster', () => {
  it.each([
    ['AWS', 'AWS', true],
    ['SCW', 'AWS', false],
    ['HELM', 'AWS', true],
    ['SCW', undefined, true],
  ])('returns %s for a %s cluster as %s', (blueprintProvider, clusterCloudProvider, expected) => {
    expect(isBlueprintCompatibleWithCluster(blueprintProvider, clusterCloudProvider)).toBe(expected)
  })
})

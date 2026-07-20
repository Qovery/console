import { formatBlueprintName } from './blueprint-utils'

describe('formatBlueprintName', () => {
  it.each([
    ['aws-rds-mysql', 'AWS RDS MySQL'],
    ['scaleway-managed-postgresql', 'Scaleway Managed PostgreSQL'],
    ['AWS S3 Bucket', 'AWS S3 Bucket'],
  ])('formats %s as %s', (name, expectedName) => {
    expect(formatBlueprintName(name)).toBe(expectedName)
  })
})

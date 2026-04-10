import {
  DatabaseAccessibilityEnum,
  DatabaseModeEnum,
  DatabaseTypeEnum,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import {
  buildDatabaseCreatePayload,
  canSelectManagedDatabaseMode,
  filterDatabaseTypes,
  findDatabaseTemplateMatch,
  formatDatabaseTypeLabel,
  generateDatabaseTypeAndVersionOptions,
  getDefaultDatabaseMode,
  getDefaultManagedDatabaseInstanceType,
} from './database-create-utils'

describe('database-create-utils', () => {
  it('finds database template defaults from template and option', () => {
    expect(findDatabaseTemplateMatch('postgresql', 'managed')).toEqual(
      expect.objectContaining({
        templateTitle: 'PostgreSQL',
        optionTitle: 'Managed',
        type: DatabaseTypeEnum.POSTGRESQL,
        mode: DatabaseModeEnum.MANAGED,
      })
    )
  })

  it('filters database types based on AWS VPC subnets', () => {
    const filteredTypes = filterDatabaseTypes(
      [
        { label: 'MONGODB', value: 'MONGODB' },
        { label: 'REDIS', value: 'REDIS' },
        { label: 'POSTGRESQL', value: 'POSTGRESQL' },
        { label: 'MYSQL', value: 'MYSQL' },
      ],
      {
        aws_vpc_eks_id: 'vpc-1',
        eks_create_nodes_in_private_subnet: false,
        eks_subnets_zone_a_ids: [],
        eks_subnets_zone_b_ids: [],
        eks_subnets_zone_c_ids: [],
        eks_karpenter_fargate_subnets_zone_a_ids: [],
        eks_karpenter_fargate_subnets_zone_b_ids: [],
        eks_karpenter_fargate_subnets_zone_c_ids: [],
        documentdb_subnets_zone_a_ids: [],
        documentdb_subnets_zone_b_ids: [],
        documentdb_subnets_zone_c_ids: [],
        elasticache_subnets_zone_a_ids: ['subnet-1'],
        elasticache_subnets_zone_b_ids: ['subnet-2'],
        elasticache_subnets_zone_c_ids: ['subnet-3'],
        rds_subnets_zone_a_ids: ['subnet-1'],
        rds_subnets_zone_b_ids: ['subnet-2'],
        rds_subnets_zone_c_ids: ['subnet-3'],
      }
    )

    expect(filteredTypes).toEqual([
      { label: 'REDIS', value: 'REDIS' },
      { label: 'POSTGRESQL', value: 'POSTGRESQL' },
      { label: 'MYSQL', value: 'MYSQL' },
    ])
  })

  it('generates type and version options by type and mode', () => {
    const options = generateDatabaseTypeAndVersionOptions([
      {
        database_type: 'POSTGRESQL',
        version: [
          {
            name: '16',
            supported_mode: DatabaseModeEnum.CONTAINER,
          },
          {
            name: '15',
            supported_mode: DatabaseModeEnum.MANAGED,
          },
        ],
      },
    ])

    expect(options.databaseTypeOptions).toEqual([
      expect.objectContaining({
        label: 'PostgreSQL',
        value: 'POSTGRESQL',
        icon: expect.any(Object),
      }),
    ])
    expect(options.databaseVersionOptions).toEqual({
      'POSTGRESQL-CONTAINER': [{ label: '16', value: '16' }],
      'POSTGRESQL-MANAGED': [{ label: '15', value: '15' }],
    })
  })

  it('returns the expected default database mode', () => {
    expect(getDefaultDatabaseMode({ cloudProvider: 'AWS', showManagedWithVpcOptions: false })).toBe(
      DatabaseModeEnum.CONTAINER
    )
    expect(getDefaultDatabaseMode({ cloudProvider: 'AZURE', showManagedWithVpcOptions: false })).toBe(
      DatabaseModeEnum.MANAGED
    )
  })

  it('returns whether managed database mode can be selected', () => {
    expect(
      canSelectManagedDatabaseMode({
        cloudProvider: 'AWS',
        cluster: { kubernetes: 'EKS' },
        showManagedWithVpcOptions: true,
      })
    ).toBe(true)
    expect(
      canSelectManagedDatabaseMode({
        cloudProvider: 'AWS',
        cluster: { kubernetes: 'SELF_MANAGED' },
        showManagedWithVpcOptions: true,
      })
    ).toBe(false)
    expect(
      canSelectManagedDatabaseMode({
        cloudProvider: 'GCP',
        cluster: { kubernetes: 'GKE' },
        showManagedWithVpcOptions: true,
      })
    ).toBe(false)
  })

  it('returns the expected default managed instance type', () => {
    expect(getDefaultManagedDatabaseInstanceType(DatabaseTypeEnum.REDIS)).toBe('cache.t3.small')
    expect(getDefaultManagedDatabaseInstanceType(DatabaseTypeEnum.MYSQL)).toBe('db.t3.small')
  })

  it('formats database type labels with the expected casing', () => {
    expect(formatDatabaseTypeLabel('Mysql')).toBe('MySQL')
    expect(formatDatabaseTypeLabel('MongoDB')).toBe('MongoDB')
  })

  it('builds a database create payload for container and managed modes', () => {
    const labelsGroup = [{ id: 'label-1', name: 'Team A' }] as OrganizationLabelsGroupEnrichedResponse[]
    const annotationsGroup = [{ id: 'annotation-1', name: 'Ops' }] as OrganizationAnnotationsGroupResponse[]

    const containerPayload = buildDatabaseCreatePayload({
      generalData: {
        name: 'postgres',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
        mode: DatabaseModeEnum.CONTAINER,
        type: DatabaseTypeEnum.POSTGRESQL,
        version: '16',
        labels_groups: ['label-1'],
        annotations_groups: ['annotation-1'],
      },
      resourcesData: {
        cpu: 500,
        memory: 512,
        storage: 20,
      },
      labelsGroup,
      annotationsGroup,
    })

    expect(containerPayload).toEqual(
      expect.objectContaining({
        mode: DatabaseModeEnum.CONTAINER,
        cpu: 500,
        memory: 512,
        storage: 20,
        labels_groups: labelsGroup,
        annotations_groups: annotationsGroup,
      })
    )

    const managedPayload = buildDatabaseCreatePayload({
      generalData: {
        name: 'redis',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
        mode: DatabaseModeEnum.MANAGED,
        type: DatabaseTypeEnum.REDIS,
        version: '7',
      },
      resourcesData: {
        cpu: 500,
        memory: 512,
        storage: 20,
        instance_type: 'cache.t3.small',
      },
      labelsGroup: [],
      annotationsGroup: [],
    })

    expect(managedPayload).toEqual(
      expect.objectContaining({
        mode: DatabaseModeEnum.MANAGED,
        instance_type: 'cache.t3.small',
      })
    )
    expect(managedPayload).not.toHaveProperty('cpu')
    expect(managedPayload).not.toHaveProperty('memory')
  })
})

import {
  DatabaseAccessibilityEnum,
  DatabaseModeEnum,
  DatabaseTypeEnum,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import {
  buildDatabaseCreatePayload,
  findDatabaseTemplateMatch,
  formatDatabaseTypeLabel,
  generateDatabaseTypeAndVersionOptions,
  sortDatabaseVersionValues,
} from './database-create-utils'

describe('database-create-utils', () => {
  it('finds database template defaults from template and option', () => {
    expect(findDatabaseTemplateMatch('postgresql', 'container')).toEqual(
      expect.objectContaining({
        templateTitle: 'PostgreSQL',
        optionTitle: 'Container',
        type: DatabaseTypeEnum.POSTGRESQL,
      })
    )
  })

  it('generates type and version options by type and mode', () => {
    const options = generateDatabaseTypeAndVersionOptions([
      {
        database_type: 'POSTGRESQL',
        version: [
          {
            name: '10',
            supported_mode: DatabaseModeEnum.CONTAINER,
          },
          {
            name: '16',
            supported_mode: DatabaseModeEnum.CONTAINER,
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
      'POSTGRESQL-CONTAINER': [
        { label: '16', value: '16' },
        { label: '10', value: '10' },
      ],
    })
  })

  it('sorts database versions from latest to oldest', () => {
    expect(
      sortDatabaseVersionValues([
        { label: '11', value: '11' },
        { label: '9.6', value: '9.6' },
        { label: '12', value: '12' },
      ])
    ).toEqual([
      { label: '12', value: '12' },
      { label: '11', value: '11' },
      { label: '9.6', value: '9.6' },
    ])
  })

  it('formats database type labels with the expected casing', () => {
    expect(formatDatabaseTypeLabel('Mysql')).toBe('MySQL')
    expect(formatDatabaseTypeLabel('MongoDB')).toBe('MongoDB')
  })

  it('builds a container database create payload', () => {
    const labelsGroup = [{ id: 'label-1', name: 'Team A' }] as OrganizationLabelsGroupEnrichedResponse[]
    const annotationsGroup = [{ id: 'annotation-1', name: 'Ops' }] as OrganizationAnnotationsGroupResponse[]

    const containerPayload = buildDatabaseCreatePayload({
      generalData: {
        name: 'postgres',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
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
  })
})

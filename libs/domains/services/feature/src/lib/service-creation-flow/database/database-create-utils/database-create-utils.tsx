import {
  type DatabaseConfiguration,
  DatabaseModeEnum,
  type DatabaseRequest,
  type DatabaseTypeEnum,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { type Value } from '@qovery/shared/interfaces'
import { Icon } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { serviceTemplates } from '../../../service-new/service-templates'

export interface DatabaseTemplateMatch {
  templateTitle?: string
  optionTitle?: string
  iconUri?: string
  type?: DatabaseTypeEnum
}

export interface DatabaseCreateGeneralData {
  name: string
  description?: string
  type?: DatabaseTypeEnum
  version?: string
  accessibility: DatabaseRequest['accessibility']
  labels_groups?: string[]
  annotations_groups?: string[]
  icon_uri?: string
}

export interface DatabaseCreateResourcesData {
  memory: number
  cpu: number
  storage: number
}

export interface DatabaseTypeVersionOptions {
  databaseTypeOptions: Value[]
  databaseVersionOptions: Record<string, Value[]>
}

export interface BuildDatabaseCreatePayloadProps {
  generalData: DatabaseCreateGeneralData
  resourcesData: DatabaseCreateResourcesData
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
}

export function formatDatabaseTypeLabel(value: string) {
  const formattedValue = upperCaseFirstLetter(value.toLowerCase()).replace(/db/g, 'DB').replace(/sql/g, 'SQL')
  return formattedValue
}

export function sortDatabaseVersionValues(versions?: Value[]) {
  return [...(versions ?? [])].sort((a, b) =>
    String(b.value).localeCompare(String(a.value), undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  )
}

export function findDatabaseTemplateMatch(template?: string, option?: string): DatabaseTemplateMatch {
  if (!template) {
    return {}
  }

  const databaseTemplate = serviceTemplates.find((serviceTemplate) => serviceTemplate.slug === template)
  const databaseOption = databaseTemplate?.options?.find(
    (serviceOption) => serviceOption.slug === option && serviceOption.type === 'DATABASE'
  )

  return {
    templateTitle: databaseTemplate?.title,
    optionTitle: databaseOption?.title,
    iconUri: databaseOption?.icon_uri ?? databaseTemplate?.icon_uri,
    type: template.toUpperCase() as DatabaseTypeEnum,
  }
}

export function generateDatabaseTypeAndVersionOptions(
  databaseConfigurations?: DatabaseConfiguration[]
): DatabaseTypeVersionOptions {
  if (!databaseConfigurations) {
    return {
      databaseTypeOptions: [],
      databaseVersionOptions: {},
    }
  }

  const databaseVersionOptions: Record<string, Value[]> = {}

  const databaseTypeOptions = databaseConfigurations.map((configuration) => {
    const databaseType = configuration.database_type as string

    configuration.version?.forEach((version) => {
      if (!version.supported_mode || !version.name) {
        return
      }

      const key = `${databaseType}-${version.supported_mode}`
      databaseVersionOptions[key] = [
        ...(databaseVersionOptions[key] ?? []),
        {
          label: version.name,
          value: version.name,
        },
      ]
    })

    return {
      label: formatDatabaseTypeLabel(databaseType),
      value: databaseType,
      icon: <Icon name={databaseType} width="16px" height="16px" />,
    }
  })

  const sortedDatabaseVersionOptions = Object.fromEntries(
    Object.entries(databaseVersionOptions).map(([key, versions]) => [key, sortDatabaseVersionValues(versions)])
  )

  return {
    databaseTypeOptions: databaseTypeOptions.filter(
      ({ value }) => sortedDatabaseVersionOptions[`${value}-${DatabaseModeEnum.CONTAINER}`]?.length
    ),
    databaseVersionOptions: sortedDatabaseVersionOptions,
  }
}

export function buildDatabaseCreatePayload({
  generalData,
  resourcesData,
  labelsGroup,
  annotationsGroup,
}: BuildDatabaseCreatePayloadProps): DatabaseRequest {
  if (!generalData.type || !generalData.version) {
    throw new Error('Database general settings are incomplete.')
  }

  return {
    name: generalData.name,
    description: generalData.description || '',
    icon_uri: generalData.icon_uri,
    type: generalData.type,
    version: generalData.version,
    accessibility: generalData.accessibility,
    mode: DatabaseModeEnum.CONTAINER,
    cpu: Number(resourcesData.cpu),
    memory: Number(resourcesData.memory),
    storage: Number(resourcesData.storage),
    annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
    labels_groups: labelsGroup.filter((group) => generalData.labels_groups?.includes(group.id)),
  }
}

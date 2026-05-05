import {
  type Cluster,
  type ClusterFeatureAwsExistingVpc,
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
  mode?: DatabaseModeEnum
}

export interface DatabaseCreateGeneralData {
  name: string
  description?: string
  mode?: DatabaseModeEnum
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
  instance_type?: string
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

const DATABASE_VPC_KEY_PREFIX_BY_TYPE: Record<DatabaseTypeEnum, string> = {
  MONGODB: 'documentdb_subnets_zone_',
  REDIS: 'elasticache_subnets_zone_',
  MYSQL: 'rds_subnets_zone_',
  POSTGRESQL: 'rds_subnets_zone_',
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
    mode:
      option === 'managed' ? DatabaseModeEnum.MANAGED : option === 'container' ? DatabaseModeEnum.CONTAINER : undefined,
  }
}

export function filterDatabaseTypes(databaseTypes: Value[], clusterVpc?: ClusterFeatureAwsExistingVpc | null) {
  if (!clusterVpc) {
    return []
  }

  return databaseTypes.filter(({ value }) => {
    const keyPrefix = DATABASE_VPC_KEY_PREFIX_BY_TYPE[value as DatabaseTypeEnum]

    return Object.entries(clusterVpc).some(
      ([key, subnets]) => key.startsWith(keyPrefix) && Array.isArray(subnets) && subnets.length > 0
    )
  })
}

export function generateDatabaseTypeAndVersionOptions(
  databaseConfigurations?: DatabaseConfiguration[],
  clusterVpc?: ClusterFeatureAwsExistingVpc | null
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
    databaseTypeOptions: clusterVpc ? filterDatabaseTypes(databaseTypeOptions, clusterVpc) : databaseTypeOptions,
    databaseVersionOptions: sortedDatabaseVersionOptions,
  }
}

export function getDefaultDatabaseMode({
  currentMode,
  cloudProvider,
  showManagedWithVpcOptions,
}: {
  currentMode?: DatabaseModeEnum
  cloudProvider?: string
  showManagedWithVpcOptions: boolean
}) {
  if (currentMode) {
    return currentMode
  }

  if (cloudProvider === 'AWS' || showManagedWithVpcOptions) {
    return DatabaseModeEnum.CONTAINER
  }

  if (cloudProvider === 'ON_PREMISE' || cloudProvider === 'GCP' || cloudProvider === 'SCW') {
    return DatabaseModeEnum.CONTAINER
  }

  return DatabaseModeEnum.MANAGED
}

export function canSelectManagedDatabaseMode({
  cloudProvider,
  cluster,
  showManagedWithVpcOptions,
}: {
  cloudProvider?: string
  cluster?: Pick<Cluster, 'kubernetes'>
  showManagedWithVpcOptions: boolean
}) {
  return showManagedWithVpcOptions && cloudProvider === 'AWS' && cluster?.kubernetes !== 'SELF_MANAGED'
}

export function getDefaultManagedDatabaseInstanceType(databaseType?: DatabaseTypeEnum) {
  if (!databaseType) {
    return undefined
  }

  return databaseType === 'REDIS' ? 'cache.t3.small' : 'db.t3.small'
}

export function buildDatabaseCreatePayload({
  generalData,
  resourcesData,
  labelsGroup,
  annotationsGroup,
}: BuildDatabaseCreatePayloadProps): DatabaseRequest {
  if (!generalData.type || !generalData.version || !generalData.mode) {
    throw new Error('Database general settings are incomplete.')
  }

  const payload: DatabaseRequest = {
    name: generalData.name,
    description: generalData.description || '',
    icon_uri: generalData.icon_uri,
    type: generalData.type,
    version: generalData.version,
    accessibility: generalData.accessibility,
    mode: generalData.mode,
    storage: Number(resourcesData.storage),
    annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
    labels_groups: labelsGroup.filter((group) => generalData.labels_groups?.includes(group.id)),
  }

  if (payload.mode === DatabaseModeEnum.MANAGED) {
    payload.instance_type = resourcesData.instance_type
  } else {
    payload.cpu = Number(resourcesData.cpu)
    payload.memory = Number(resourcesData.memory)
  }

  return payload
}

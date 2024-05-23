import {
  type ClusterFeatureAwsExistingVpc,
  type DatabaseConfiguration,
  DatabaseModeEnum,
  type DatabaseTypeEnum,
  KubernetesEnum,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment, useListDatabaseConfigurations } from '@qovery/domains/environments/feature'
import { type Value } from '@qovery/shared/interfaces'
import {
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type ValueOf } from '@qovery/shared/util-types'
import StepGeneral from '../../../ui/page-database-create/step-general/step-general'
import { findTemplateData } from '../../page-job-create-feature/page-job-create-feature'
import { serviceTemplates } from '../../page-new-feature/service-templates'
import { type GeneralData } from '../database-creation-flow.interface'
import { useDatabaseCreateContext } from '../page-database-create-feature'

export function filterDatabaseTypes(databaseTypes: Value[], clusterVpc: ClusterFeatureAwsExistingVpc) {
  if (!clusterVpc) return []

  type DB_TYPES = keyof typeof DatabaseTypeEnum

  const dbTypeMappings: Record<DB_TYPES, string> = {
    MONGODB: 'documentdb_subnets_zone_',
    REDIS: 'elasticache_subnets_zone_',
    MYSQL: 'rds_subnets_zone_',
    POSTGRESQL: 'rds_subnets_zone_',
  }

  return databaseTypes.filter(({ value: dbType }) =>
    Object.entries(clusterVpc).some(
      ([key, subnets]: [string, ValueOf<ClusterFeatureAwsExistingVpc>]) =>
        key.startsWith(dbTypeMappings[dbType as DB_TYPES]) && Array.isArray(subnets) && subnets.length > 0
    )
  )
}

export const generateDatabasesTypesAndVersionOptions = (
  databaseConfigs?: DatabaseConfiguration[],
  clusterVpc?: ClusterFeatureAwsExistingVpc | null
) => {
  if (!databaseConfigs)
    return {
      databaseTypeOptions: [],
      databaseVersionOptions: undefined,
    }

  const databaseVersionOptions: { [Key: string]: Value[] } = {}

  const databaseTypeOptions: Value[] = databaseConfigs.map((config) => {
    const label = (`${config.database_type}` as string) || ''

    let versionsStored: DatabaseModeEnum[] = []

    databaseVersionOptions[label] =
      config.version?.map((v) => {
        const versionNumber = v.name

        if (databaseVersionOptions[`${label}-${v.supported_mode}`]) {
          databaseVersionOptions[`${label}-${v.supported_mode}`] = [
            {
              label: versionNumber || '',
              value: versionNumber || '',
            },
            ...databaseVersionOptions[`${label}-${v.supported_mode}`],
          ]
        } else {
          databaseVersionOptions[`${label}-${v.supported_mode}`] = [
            {
              label: versionNumber || '',
              value: versionNumber || '',
            },
          ]
        }

        if (v.supported_mode) versionsStored.push(v.supported_mode)

        return { label: v.supported_mode || '', value: v.supported_mode || '' } as Value
      }) || []

    versionsStored = [...new Set(versionsStored)]
    // removing twins
    databaseVersionOptions[label] = versionsStored.map((v) => {
      return { value: v, label: v, icon: <Icon name={v} height="16" width="16" /> }
    })

    return {
      label: label,
      value: label,
      icon: <Icon name={label} height="16" width="16" />,
    }
  })

  return {
    databaseTypeOptions: clusterVpc ? filterDatabaseTypes(databaseTypeOptions, clusterVpc) : databaseTypeOptions,
    databaseVersionOptions,
  }
}

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Database')
  const { setGeneralData, generalData, setCurrentStep, creationFlowUrl } = useDatabaseCreateContext()
  const { organizationId = '', environmentId = '', slug, option } = useParams()
  const navigate = useNavigate()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const { data: databaseConfigurations } = useListDatabaseConfigurations({ environmentId })

  const cloudProvider = environment?.cloud_provider.provider
  const clusterVpc = cluster?.features?.find(({ id }) => id === 'EXISTING_VPC')?.value as ClusterFeatureAwsExistingVpc
  const showManagedWithVpcOptions =
    generateDatabasesTypesAndVersionOptions(databaseConfigurations, clusterVpc).databaseTypeOptions.length > 0

  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)
  const dataOptionTemplate = option !== 'current' ? findTemplateData(slug, option) : null

  const methods = useForm<GeneralData>({
    defaultValues: generalData
      ? generalData
      : cloudProvider === 'AWS' && cluster?.kubernetes !== 'SELF_MANAGED'
        ? {
            name: dataTemplate?.slug ?? '',
            mode: dataOptionTemplate?.slug === 'container' ? DatabaseModeEnum.CONTAINER : DatabaseModeEnum.MANAGED,
            type: dataTemplate?.slug?.toUpperCase() as DatabaseTypeEnum,
          }
        : {
            name: dataTemplate?.slug ?? '',
            mode: dataOptionTemplate?.slug === 'managed' ? DatabaseModeEnum.MANAGED : DatabaseModeEnum.CONTAINER,
            type: dataTemplate?.slug?.toUpperCase() as DatabaseTypeEnum,
          },
    mode: 'onChange',
  })

  const watchModeDatabase = methods.watch('mode')
  const watchTypeDatabase = methods.watch('type')

  const { databaseTypeOptions, databaseVersionOptions } = generateDatabasesTypesAndVersionOptions(
    databaseConfigurations,
    watchModeDatabase === 'MANAGED' ? clusterVpc : undefined
  )

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const publicOptionNotAvailable =
    cluster?.kubernetes === KubernetesEnum.K3_S && watchModeDatabase === DatabaseModeEnum.CONTAINER

  useEffect(() => {
    if (methods.formState.isDirty) {
      methods.setValue('version', '')
      if (watchTypeDatabase) methods.trigger('version')
    }
  }, [watchModeDatabase, methods.setValue])

  const onSubmit = methods.handleSubmit((data) => {
    const cloneData = {
      ...data,
    }

    setGeneralData(cloneData)
    navigate(creationFlowUrl + SERVICES_DATABASE_CREATION_RESOURCES_URL)
  })

  return (
    cluster && (
      <FunnelFlowBody>
        <FormProvider {...methods}>
          <StepGeneral
            cloudProvider={cloudProvider}
            cluster={cluster}
            onSubmit={onSubmit}
            databaseTypeOptions={databaseTypeOptions}
            databaseVersionOptions={databaseVersionOptions}
            publicOptionNotAvailable={publicOptionNotAvailable}
            clusterVpc={clusterVpc}
            showManagedWithVpcOptions={showManagedWithVpcOptions}
          />
        </FormProvider>
      </FunnelFlowBody>
    )
  )
}

export default StepGeneralFeature

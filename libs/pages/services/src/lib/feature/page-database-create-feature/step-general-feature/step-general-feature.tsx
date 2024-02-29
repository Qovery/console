import {
  type ClusterFeatureAwsExistingVpc,
  type DatabaseConfiguration,
  DatabaseModeEnum,
  type DatabaseTypeEnum,
  KubernetesEnum,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useFetchDatabaseConfiguration, useFetchEnvironment } from '@qovery/domains/environment'
import { type Value } from '@qovery/shared/interfaces'
import {
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard, Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepGeneral from '../../../ui/page-database-create/step-general/step-general'
import { type GeneralData } from '../database-creation-flow.interface'
import { useDatabaseCreateContext } from '../page-database-create-feature'

function getDatabaseType(databaseTypes: Value[], type: DatabaseTypeEnum) {
  return databaseTypes.find((db) => db.label === type)
}

export function filterDatabaseTypes(databaseTypes: Value[], clusterVpc: ClusterFeatureAwsExistingVpc) {
  if (!clusterVpc) return []

  const dbTypeMappings: { [key: string]: DatabaseTypeEnum[] } = {
    documentdb_subnets_zone_: ['MONGODB'],
    elasticache_subnets_zone_: ['REDIS'],
    rds_subnets_zone_: ['POSTGRESQL', 'MYSQL'],
  }

  return Object.entries(clusterVpc).reduce((filteredTypes: Value[], [key, value]) => {
    const dbType = Object.keys(dbTypeMappings).find((prefix) => key.startsWith(prefix))

    if (dbType && value.length > 0) {
      dbTypeMappings[dbType].forEach((dbType) => {
        const databaseType = getDatabaseType(databaseTypes, dbType)
        if (databaseType) filteredTypes.push(databaseType)
      })
    }

    return filteredTypes.filter((type, index) => filteredTypes.indexOf(type) === index)
  }, [])
}

export const generateDatabasesTypesAndVersionOptions = (
  databaseConfigs: DatabaseConfiguration[],
  clusterVpc?: ClusterFeatureAwsExistingVpc | null
) => {
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
  const { setGeneralData, generalData, setCurrentStep } = useDatabaseCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const { data: environment } = useFetchEnvironment(projectId, environmentId)
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const { data: databaseConfigurations } = useFetchDatabaseConfiguration(projectId, environmentId)

  const [databaseTypeOptions, setDatabaseTypeOptions] = useState<Value[]>()
  const [databaseVersionOptions, setDatabaseVersionOptions] = useState<{ [Key: string]: Value[] }>()

  const cloudProvider = environment?.cloud_provider.provider
  const clusterVpc = cluster?.features?.find(({ id }) => id === 'EXISTING_VPC')?.value as ClusterFeatureAwsExistingVpc

  const methods = useForm<GeneralData>({
    defaultValues: generalData
      ? generalData
      : cloudProvider === 'AWS' && cluster?.kubernetes !== 'SELF_MANAGED'
      ? { mode: DatabaseModeEnum.MANAGED }
      : { mode: DatabaseModeEnum.CONTAINER },
    mode: 'onChange',
  })

  const watchModeDatabase = methods.watch('mode')
  const watchTypeDatabase = methods.watch('type')

  console.log(watchModeDatabase)

  useEffect(() => {
    if (databaseConfigurations && databaseConfigurations.length && !databaseTypeOptions && !databaseVersionOptions) {
      const { databaseTypeOptions, databaseVersionOptions } = generateDatabasesTypesAndVersionOptions(
        databaseConfigurations,
        watchModeDatabase === 'MANAGED' ? clusterVpc : undefined
      )
      setDatabaseTypeOptions(databaseTypeOptions)
      setDatabaseVersionOptions(databaseVersionOptions)
    }
  }, [databaseConfigurations, environment, environmentId, clusterVpc])

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Database creation flow"
      items={[
        'Qovery supports out of the box a list of major databases.',
        'Select the right “mode” based on your needs (production or development)',
        'You can access your DB from outside your cluster by chaing its accessibility to public.',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#create-a-database',
            linkLabel: 'How to configure my database',
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum' },
        ],
      }}
    />
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
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DATABASE_CREATION_URL}`
    navigate(pathCreate + SERVICES_DATABASE_CREATION_RESOURCES_URL)
  })

  return (
    cluster && (
      <FunnelFlowBody helpSection={funnelCardHelp}>
        <FormProvider {...methods}>
          <StepGeneral
            cloudProvider={cloudProvider}
            cluster={cluster}
            onSubmit={onSubmit}
            databaseTypeOptions={databaseTypeOptions}
            databaseVersionOptions={databaseVersionOptions}
            publicOptionNotAvailable={publicOptionNotAvailable}
          />
        </FormProvider>
      </FunnelFlowBody>
    )
  )
}

export default StepGeneralFeature

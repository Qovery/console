import { DatabaseConfiguration, DatabaseModeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchDatabaseConfiguration, selectEnvironmentById } from '@qovery/domains/environment'
import { EnvironmentEntity, Value } from '@qovery/shared/interfaces'
import {
  SERVICES_DATABASE_CREATION_POST_URL,
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard, Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import StepGeneral from '../../../ui/page-database-create/step-general/step-general'
import { GeneralData } from '../database-creation-flow.interface'
import { useDatabaseCreateContext } from '../page-database-create-feature'

export const generateDatabasesTypesAndVersionOptions = (databaseConfigs: DatabaseConfiguration[]) => {
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
    databaseTypeOptions,
    databaseVersionOptions,
  }
}

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Database')
  const { setGeneralData, generalData, setCurrentStep } = useDatabaseCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const dispatch = useDispatch<AppDispatch>()

  const [databaseTypeOptions, setDatabaseTypeOptions] = useState<Value[]>()
  const [databaseVersionOptions, setDatabaseVersionOptions] = useState<{ [Key: string]: Value[] }>()

  useEffect(() => {
    if (!environment?.databaseConfigurations || environment.databaseConfigurations.loadingStatus === 'not loaded') {
      dispatch(fetchDatabaseConfiguration({ environmentId }))
    }

    if (
      environment?.databaseConfigurations?.loadingStatus === 'loaded' &&
      environment?.databaseConfigurations?.data &&
      !databaseTypeOptions &&
      !databaseVersionOptions
    ) {
      const { databaseTypeOptions, databaseVersionOptions } = generateDatabasesTypesAndVersionOptions(
        environment.databaseConfigurations.data
      )
      setDatabaseTypeOptions(databaseTypeOptions)
      setDatabaseVersionOptions(databaseVersionOptions)
    }
  }, [dispatch, environment, environmentId])

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
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )
  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<GeneralData>({
    defaultValues: generalData ? generalData : { mode: DatabaseModeEnum.MANAGED },
    mode: 'onChange',
  })

  const watchModeDatabase = methods.watch('mode')
  const watchTypeDatabase = methods.watch('type')

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

    if (data.mode === DatabaseModeEnum.MANAGED) {
      navigate(pathCreate + SERVICES_DATABASE_CREATION_POST_URL)
    } else {
      navigate(pathCreate + SERVICES_DATABASE_CREATION_RESOURCES_URL)
    }
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepGeneral
          cloudProvider={environment?.cloud_provider.provider}
          onSubmit={onSubmit}
          databaseTypeOptions={databaseTypeOptions}
          databaseVersionOptions={databaseVersionOptions}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature

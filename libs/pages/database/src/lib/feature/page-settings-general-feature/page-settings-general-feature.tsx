import { DatabaseModeEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useFetchDatabaseConfiguration, useFetchEnvironment } from '@qovery/domains/environment'
import { type Database } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, database: Database) => {
  const cloneDatabase = Object.assign({}, database)
  cloneDatabase.name = data['name']
  cloneDatabase.description = data['description']
  cloneDatabase.accessibility = data['accessibility']
  cloneDatabase.version = data['version']

  return cloneDatabase
}

export function PageSettingsGeneralFeature() {
  const { organizationId = '', environmentId = '', projectId = '', databaseId = '' } = useParams()

  const { data: database } = useService({ serviceId: databaseId, serviceType: 'DATABASE' })
  const { mutate: editService, isLoading: isLoadingService } = useEditService({ environmentId })
  const { data: environment } = useFetchEnvironment(projectId, environmentId)
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const { data: databaseConfigurations, isLoading } = useFetchDatabaseConfiguration(projectId, environmentId)

  const databaseVersionOptions = databaseConfigurations
    ?.find((c) => c.database_type === database?.type)
    ?.version?.filter((v) => v.supported_mode === database?.mode)
    .map((v) => ({
      label: v.name || '',
      value: v.name || '',
    }))

  const publicOptionNotAvailable =
    cluster?.kubernetes === KubernetesEnum.K3_S && database?.mode === DatabaseModeEnum.CONTAINER

  const methods = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: database?.name,
      description: database?.description,
      type: database?.type,
      mode: database?.mode,
      version: database?.version,
      accessibility: database?.accessibility,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data && database) {
      const cloneDatabase = handleSubmit(data, database)

      editService({
        serviceId: databaseId,
        payload: cloneDatabase,
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral
        onSubmit={onSubmit}
        loading={isLoadingService}
        publicOptionNotAvailable={publicOptionNotAvailable}
        databaseVersionLoading={isLoading}
        databaseVersionOptions={databaseVersionOptions}
        databaseMode={database?.mode}
      />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature

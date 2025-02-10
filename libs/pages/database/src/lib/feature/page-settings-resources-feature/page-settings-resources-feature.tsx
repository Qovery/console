import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type Database } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, database: Database) => {
  const cloneDatabase = Object.assign({}, database)

  cloneDatabase.cpu = data['cpu']
  cloneDatabase.memory = Number(data['memory'])
  cloneDatabase.storage = Number(data['storage'])
  cloneDatabase.instance_type = data['instance_type']

  return cloneDatabase
}

export function PageSettingsResourcesFeature() {
  const { databaseId = '', environmentId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: database } = useService({ serviceId: databaseId, serviceType: 'DATABASE' })

  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId: environment?.organization.id || '',
    projectId: environment?.project.id || '',
    environmentId,
  })

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: database?.memory,
      storage: database?.storage,
      cpu: database?.cpu || 10,
      instance_type: database?.instance_type,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!database) return
    editService({
      serviceId: databaseId,
      payload: buildEditServicePayload({ service: database, request: handleSubmit(data, database) }),
    })
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={isLoadingEditService}
        database={database}
        clusterId={environment?.cluster_id}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature

import { DatabaseModeEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment, useListDatabaseConfigurations } from '@qovery/domains/environments/feature'
import {
  useAddAnnotationsGroup,
  useAnnotationsGroup,
  useDeleteAnnotationsGroup,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export function PageSettingsGeneralFeature() {
  const { organizationId = '', environmentId = '', databaseId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const { data: database } = useService({ serviceId: databaseId, serviceType: 'DATABASE' })
  const { mutate: editService, isLoading: isLoadingService } = useEditService({ environmentId })
  const { data: databaseConfigurations, isLoading } = useListDatabaseConfigurations({ environmentId })

  const { data: annotationsGroup = [] } = useAnnotationsGroup({
    serviceId: databaseId,
    serviceType: 'DATABASE',
  })
  const { mutate: deleteAnnotationGroup } = useDeleteAnnotationsGroup()
  const { mutate: addAnnotationsGroup } = useAddAnnotationsGroup()

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
      annotations_groups: annotationsGroup.map(({ id }) => id) ?? [],
    },
  })

  useEffect(() => {
    // We are a separate request to get annotations group
    // To join default values with Service request with need this useEffect
    methods.setValue(
      'annotations_groups',
      annotationsGroup?.map(({ id }) => id)
    )
  }, [methods, annotationsGroup])

  const onSubmit = methods.handleSubmit((data) => {
    if (data && database) {
      const { annotations_groups, ...dataWithoutAnnotationsGroups } = data

      editService({
        serviceId: databaseId,
        payload: buildEditServicePayload({ service: database, request: dataWithoutAnnotationsGroups }),
      })

      const annotationsGroupIds = annotationsGroup.map(({ id }) => id) ?? []
      const addedAnnotationsGroup = annotations_groups.filter((id) => !annotationsGroupIds.includes(id))
      addedAnnotationsGroup.forEach((id) =>
        addAnnotationsGroup({ serviceId: databaseId, serviceType: 'DATABASE', annotationsGroupId: id })
      )

      const deletedAnnotationGroup = annotationsGroupIds.filter((id) => !annotations_groups.includes(id))
      deletedAnnotationGroup.forEach((id) =>
        deleteAnnotationGroup({ serviceId: databaseId, serviceType: 'DATABASE', annotationsGroupId: id })
      )
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

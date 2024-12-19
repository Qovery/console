import { DatabaseModeEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment, useListDatabaseConfigurations } from '@qovery/domains/environments/feature'
import { useAnnotationsGroups, useLabelsGroups } from '@qovery/domains/organizations/feature'
import { useDeploymentStatus, useEditService, useService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export function PageSettingsGeneralFeature() {
  const { organizationId = '', environmentId = '', databaseId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId: databaseId })
  const { data: database } = useService({ serviceId: databaseId, serviceType: 'DATABASE' })
  const { mutate: editService, isLoading: isLoadingService } = useEditService({
    environmentId,
    logsLink:
      ENVIRONMENT_LOGS_URL(environment?.organization.id, environment?.project.id, environment?.id) +
      DEPLOYMENT_LOGS_VERSION_URL(database?.id, deploymentStatus?.execution_id),
  })
  const { data: databaseConfigurations, isLoading } = useListDatabaseConfigurations({ environmentId })

  const { data: labelsGroups = [] } = useLabelsGroups({ organizationId })
  const { data: annotationsGroups = [] } = useAnnotationsGroups({ organizationId })

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
      icon_uri: database?.icon_uri,
      type: database?.type,
      mode: database?.mode,
      version: database?.version,
      accessibility: database?.accessibility,
      annotations_groups: database?.annotations_groups?.map((group) => group.id),
      labels_groups: database?.labels_groups?.map((group) => group.id),
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data && database) {
      const { annotations_groups, labels_groups, ...dataWithoutAnnotationsLabelsGroups } = data

      editService({
        serviceId: databaseId,
        payload: buildEditServicePayload({
          service: database,
          request: {
            ...dataWithoutAnnotationsLabelsGroups,
            labels_groups: labelsGroups.filter((group) => data.labels_groups?.includes(group.id)),
            annotations_groups: annotationsGroups.filter((group) => data.annotations_groups?.includes(group.id)),
          },
        }),
      })
    }
  })

  return (
    <FormProvider {...methods}>
      {database && (
        <PageSettingsGeneral
          onSubmit={onSubmit}
          loading={isLoadingService}
          publicOptionNotAvailable={publicOptionNotAvailable}
          databaseVersionLoading={isLoading}
          databaseVersionOptions={databaseVersionOptions}
          database={database}
        />
      )}
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature

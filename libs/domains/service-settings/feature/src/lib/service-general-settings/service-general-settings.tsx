import { useParams } from '@tanstack/react-router'
import { type Organization } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useListDatabaseConfigurations } from '@qovery/domains/environments/feature'
import {
  ContainerRegistryCreateEditModal,
  useAnnotationsGroups,
  useLabelsGroups,
} from '@qovery/domains/organizations/feature'
import {
  type ServiceGeneralData,
  buildServiceGeneralPayload,
  getServiceGeneralDefaultValues,
  sortDatabaseVersionValues,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, LoaderSpinner, Section, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ApplicationGeneralSettings } from './application-general-settings/application-general-settings'
import { ContainerGeneralSettings } from './container-general-settings/container-general-settings'
import { DatabaseGeneralSettings } from './database-general-settings/database-general-settings'
import { HelmGeneralSettings } from './helm-general-settings/helm-general-settings'
import { JobGeneralSettings } from './job-general-settings/job-general-settings'
import { TerraformGeneralSettings } from './terraform-general-settings/terraform-general-settings'

export interface ServiceGeneralSettingsProps {
  organization: Organization
}

const GeneralSettingsFallback = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

export function ServiceGeneralSettings(props: ServiceGeneralSettingsProps) {
  return (
    <Suspense fallback={<GeneralSettingsFallback />}>
      <ServiceGeneralSettingsContent {...props} />
    </Suspense>
  )
}

function ServiceGeneralSettingsContent({ organization }: ServiceGeneralSettingsProps) {
  useDocumentTitle('General - Service settings')
  const {
    projectId = '',
    environmentId = '',
    serviceId = '',
  } = useParams({
    strict: false,
  })
  const { openModal, closeModal } = useModal()

  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { data: labelsGroups = [] } = useLabelsGroups({ organizationId: organization.id, suspense: true })
  const { data: annotationsGroups = [] } = useAnnotationsGroups({ organizationId: organization.id, suspense: true })
  const { data: databaseConfigurations, isLoading: isDatabaseVersionLoading } = useListDatabaseConfigurations({
    environmentId,
    suspense: true,
    enabled: service?.serviceType === 'DATABASE',
  })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId: organization.id,
    projectId,
    environmentId,
  })

  const defaultValues = service ? getServiceGeneralDefaultValues(service) : {}

  const databaseVersionOptions =
    service?.serviceType === 'DATABASE'
      ? sortDatabaseVersionValues(
          (
            databaseConfigurations
              ?.find((configuration) => configuration.database_type === service.type)
              ?.version?.filter((version) => version.supported_mode === service.mode) ?? []
          ).map((version) => ({
            label: version.name || '',
            value: version.name || '',
          }))
        )
      : undefined

  const methods = useForm<ServiceGeneralData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: service?.name,
      description: service?.description,
      icon_uri: service?.icon_uri,
      ...defaultValues,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) {
      return
    }

    const payload = buildServiceGeneralPayload({
      service,
      data,
      labelsGroups,
      annotationsGroups,
    })

    editService({
      serviceId,
      payload,
    })
  })

  const openContainerRegistryCreateEditModal = () => {
    openModal({
      content: <ContainerRegistryCreateEditModal organizationId={organization.id} onClose={closeModal} />,
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  if (!service || !organization) {
    return null
  }

  const headingDescription =
    service.serviceType === 'DATABASE'
      ? 'These general settings allow you to set up the database name, type and version.'
      : 'These general settings allow you to set up the service name, its source and deployment parameters.'

  const formContent = match(service)
    .with({ serviceType: 'APPLICATION' }, (application) => (
      <ApplicationGeneralSettings service={application} organization={organization} />
    ))
    .with({ serviceType: 'CONTAINER' }, (container) => (
      <ContainerGeneralSettings
        service={container}
        organization={organization}
        openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
      />
    ))
    .with({ serviceType: 'JOB' }, (job) => (
      <JobGeneralSettings
        service={job}
        organization={organization}
        openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
      />
    ))
    .with({ serviceType: 'HELM' }, (helm) => <HelmGeneralSettings service={helm} organization={organization} />)
    .with({ serviceType: 'TERRAFORM' }, (terraform) => (
      <TerraformGeneralSettings service={terraform} organization={organization} />
    ))
    .with({ serviceType: 'DATABASE' }, (database) => (
      <DatabaseGeneralSettings
        database={database}
        databaseVersionLoading={isDatabaseVersionLoading}
        databaseVersionOptions={databaseVersionOptions}
      />
    ))
    .exhaustive()

  return (
    <FormProvider {...methods}>
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading title="General settings" description={headingDescription} />
        <div className="max-w-content-with-navigation-left">
          <form onSubmit={onSubmit} className="space-y-10">
            {formContent}
            <div className="mt-10 flex justify-end">
              <Button type="submit" size="lg" loading={isLoadingEditService} disabled={!methods.formState.isValid}>
                Save
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </FormProvider>
  )
}

export default ServiceGeneralSettings

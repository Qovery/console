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
  BlueprintDetailModal,
  BlueprintSettingsSection,
  BlueprintUpdateReviewModal,
  MOCK_BLUEPRINTS,
  type NewSetupParameter,
  type ServiceGeneralData,
  type UpdateChange,
  buildServiceGeneralPayload,
  getServiceGeneralDefaultValues,
  sortDatabaseVersionValues,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, LoaderSpinner, Section, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

// ─── Blueprint demo toggle ───────────────────────────────────────────────────
// Flip to true to preview the blueprint settings section on any service.
// When the catalog API is wired, this becomes a real check on `service.blueprint_ref`.
const SHOW_BLUEPRINT_SECTION = true

const DEMO_BLUEPRINT = MOCK_BLUEPRINTS.find((b) => b.id === 'aws-postgres')
const DEMO_CURRENT_VERSION = '1.0.0'
const DEMO_MAJOR_SERVICE_VERSION = 'PostgreSQL 15'
const DEMO_CHANGES: Record<string, UpdateChange[]> = {
  '1.0.0': [
    {
      kind: 'changed',
      category: 'config',
      label: 'Default backup retention',
      before: '7 days',
      after: '14 days',
    },
    { kind: 'added', category: 'infrastructure', label: 'CloudWatch alarm: high CPU' },
    { kind: 'removed', category: 'infrastructure', label: 'Legacy snapshot bucket' },
  ],
}
const DEMO_NEW_SETUP: Record<string, NewSetupParameter[]> = {
  '1.0.0': [
    {
      id: 'maintenanceWindow',
      label: 'Maintenance window',
      required: true,
      helper: 'Format: ddd:hh24:mm-ddd:hh24:mm — e.g. Sun:03:00-Sun:04:00',
    },
  ],
}
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

  const openBlueprintDetails = () => {
    if (!DEMO_BLUEPRINT) return
    openModal({
      content: <BlueprintDetailModal blueprint={DEMO_BLUEPRINT} onClose={closeModal} onUse={() => undefined} />,
    })
  }

  const openBlueprintUpdateReview = (defaultTarget: string) => {
    if (!DEMO_BLUEPRINT) return
    openModal({
      content: (
        <BlueprintUpdateReviewModal
          blueprint={DEMO_BLUEPRINT}
          currentVersion={DEMO_CURRENT_VERSION}
          defaultTargetVersion={defaultTarget}
          changesByTargetVersion={DEMO_CHANGES}
          newSetupByTargetVersion={DEMO_NEW_SETUP}
          onCancel={closeModal}
          onApprove={() => closeModal()}
        />
      ),
      options: { width: 640 },
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
            {SHOW_BLUEPRINT_SECTION && DEMO_BLUEPRINT && (
              <BlueprintSettingsSection
                blueprint={DEMO_BLUEPRINT}
                currentVersion={DEMO_CURRENT_VERSION}
                majorServiceVersion={DEMO_MAJOR_SERVICE_VERSION}
                onVersionChange={(target) => openBlueprintUpdateReview(target)}
                onViewDetails={openBlueprintDetails}
                onDetach={() => undefined}
              />
            )}
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

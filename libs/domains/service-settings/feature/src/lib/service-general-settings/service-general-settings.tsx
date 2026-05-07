import { useNavigate, useParams } from '@tanstack/react-router'
import { type Organization } from 'qovery-typescript-axios'
import { Suspense, useState } from 'react'
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
  BlueprintUpdateReviewModal,
  MOCK_BLUEPRINTS,
  type ServiceGeneralData,
  buildServiceGeneralPayload,
  getServiceGeneralDefaultValues,
  sortDatabaseVersionValues,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, LoaderSpinner, Section, SidePanel, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ApplicationGeneralSettings } from './application-general-settings/application-general-settings'
import { BlueprintGeneralSection } from './blueprint-general-section/blueprint-general-section'
import { ContainerGeneralSettings } from './container-general-settings/container-general-settings'
import { DatabaseGeneralSettings } from './database-general-settings/database-general-settings'
import { HelmGeneralSettings } from './helm-general-settings/helm-general-settings'
import { JobGeneralSettings } from './job-general-settings/job-general-settings'
import { TerraformGeneralSettings } from './terraform-general-settings/terraform-general-settings'

// ─── Blueprint demo toggle ───────────────────────────────────────────────────
// Flip to true to preview the blueprint settings section on any service.
// When the catalog API is wired, this becomes a real check on `service.blueprint_ref`.
const SHOW_BLUEPRINT_SECTION = true

const DEMO_BLUEPRINT = MOCK_BLUEPRINTS[0] ?? null
const DEMO_BLUEPRINT_VERSION = '1.24'
const DEMO_MAJOR_SERVICE_VERSION = 'PostgreSQL 15'

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
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const [isBlueprintDetailsOpen, setBlueprintDetailsOpen] = useState(false)

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
    setBlueprintDetailsOpen(true)
  }

  const openBlueprintUpdateReview = () => {
    if (!DEMO_BLUEPRINT) return
    openModal({
      content: (
        <BlueprintUpdateReviewModal
          targetVersion="2.1"
          releaseNotesUrl={DEMO_BLUEPRINT.repositoryUrl}
          changesSummary={{ added: 3, changed: 2, removed: 1 }}
          onCancel={closeModal}
          onReview={() => {
            closeModal()
            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update-blueprint',
              params: { organizationId: organization.id, projectId, environmentId, serviceId },
              search: { targetVersion: '2.1', from: 'settings' },
            })
          }}
        />
      ),
      options: { width: 488, fakeModal: true },
    })
  }

  if (!service || !organization) {
    return null
  }

  const isBlueprintManaged = SHOW_BLUEPRINT_SECTION && Boolean(DEMO_BLUEPRINT)

  const headingDescription = isBlueprintManaged
    ? 'These general settings allow you to set up the service name and blueprint parameters.'
    : service.serviceType === 'DATABASE'
      ? 'These general settings allow you to set up the database name, type and version.'
      : 'These general settings allow you to set up the service name, its source and deployment parameters.'

  const blueprintSection = DEMO_BLUEPRINT ? (
    <BlueprintGeneralSection
      organizationId={organization.id}
      blueprint={DEMO_BLUEPRINT}
      blueprintVersion={DEMO_BLUEPRINT_VERSION}
      serviceVersion={DEMO_MAJOR_SERVICE_VERSION}
      onOpenBlueprintDetails={openBlueprintDetails}
      onUpdateBlueprint={openBlueprintUpdateReview}
    />
  ) : undefined

  const formContent = match(service)
    .with({ serviceType: 'APPLICATION' }, (application) => (
      <ApplicationGeneralSettings
        service={application}
        organization={organization}
        isBlueprintManaged={isBlueprintManaged}
        blueprintSection={blueprintSection}
      />
    ))
    .with({ serviceType: 'CONTAINER' }, (container) => (
      <ContainerGeneralSettings
        service={container}
        organization={organization}
        openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
        isBlueprintManaged={isBlueprintManaged}
        blueprintSection={blueprintSection}
      />
    ))
    .with({ serviceType: 'JOB' }, (job) => (
      <JobGeneralSettings
        service={job}
        organization={organization}
        openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
        isBlueprintManaged={isBlueprintManaged}
        blueprintSection={blueprintSection}
      />
    ))
    .with({ serviceType: 'HELM' }, (helm) => (
      <HelmGeneralSettings
        service={helm}
        organization={organization}
        isBlueprintManaged={isBlueprintManaged}
        blueprintSection={blueprintSection}
      />
    ))
    .with({ serviceType: 'TERRAFORM' }, (terraform) => (
      <TerraformGeneralSettings
        service={terraform}
        organization={organization}
        isBlueprintManaged={isBlueprintManaged}
        blueprintSection={blueprintSection}
      />
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
      <>
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
        <SidePanel open={isBlueprintDetailsOpen} onOpenChange={setBlueprintDetailsOpen} width={940}>
          {DEMO_BLUEPRINT ? (
            <BlueprintDetailModal blueprint={DEMO_BLUEPRINT} onClose={() => setBlueprintDetailsOpen(false)} readOnly />
          ) : null}
        </SidePanel>
      </>
    </FormProvider>
  )
}

export default ServiceGeneralSettings

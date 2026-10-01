import { useParams } from '@tanstack/react-router'
import { Suspense, useEffect } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import {
  type Application,
  BUILD_SETTINGS_SERVICE_TYPES,
  type Job,
  type Terraform,
} from '@qovery/domains/services/data-access'
import {
  useAdvancedSettings,
  useDefaultAdvancedSettings,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Callout, Icon, InputText, InputToggle, LoaderSpinner, Section } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { buildEditServicePayload } from '@qovery/shared/util-services'

type BuildSettingsService = Application | Job | Terraform

function isBuildSettingsServiceType(serviceType: string): serviceType is BuildSettingsService['serviceType'] {
  return (BUILD_SETTINGS_SERVICE_TYPES as readonly string[]).includes(serviceType)
}

interface BuildSettingsFormData {
  timeout_max_sec: number | ''
  cpu_max_in_milli: number | ''
  ram_max_in_gib: number | ''
  ephemeral_storage_in_gib: number | ''
  disable_buildkit_cache: boolean
  skip_git_submodules: boolean
}

function getDefaultValues(
  advancedSettings: Record<string, unknown> | undefined,
  defaultAdvancedSettings: Record<string, unknown> | undefined
): BuildSettingsFormData {
  const get = (key: string) => advancedSettings?.[key] ?? defaultAdvancedSettings?.[key]
  return {
    timeout_max_sec: (get('build.timeout_max_sec') as number) ?? '',
    cpu_max_in_milli: (get('build.cpu_max_in_milli') as number) ?? '',
    ram_max_in_gib: (get('build.ram_max_in_gib') as number) ?? '',
    ephemeral_storage_in_gib: (get('build.ephemeral_storage_in_gib') as number) ?? '',
    disable_buildkit_cache: (get('build.disable_buildkit_cache') as boolean) ?? false,
    skip_git_submodules: (get('build.skip_git_submodules') as boolean) ?? false,
  }
}

function toNumberOrNull(value: number | ''): number | null {
  if (value === '') return null
  return Number(value)
}

interface BuildSettingsFormProps {
  service: BuildSettingsService
  onSubmit: () => void
  loading: boolean
  disabled: boolean
  defaultAdvancedSettings: Record<string, unknown> | undefined
}

function BuildSettingsForm({ service, onSubmit, loading, disabled, defaultAdvancedSettings }: BuildSettingsFormProps) {
  const { formState, control } = useFormContext<BuildSettingsFormData>()
  const { showChat } = useSupportChat()

  const isTerraform = service.serviceType === 'TERRAFORM'

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading title="Build settings" description="Configure the build parameters for this service." />
        <div className="max-w-content-with-navigation-left">
          {disabled && (
            <Callout.Root color="yellow" className="mb-6">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text className="flex w-full items-center justify-between">
                <span>Build settings customization is not available for your organization.</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  color="yellow"
                  className="shrink-0"
                  onClick={showChat}
                >
                  Contact support
                </Button>
              </Callout.Text>
            </Callout.Root>
          )}
          <form className="space-y-10" onSubmit={onSubmit}>
            <div className="space-y-6">
              <Controller
                name="timeout_max_sec"
                control={control}
                render={({ field }) => (
                  <InputText
                    name={field.name}
                    label="Timeout (seconds)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                    placeholder={defaultAdvancedSettings?.['build.timeout_max_sec']?.toString()}
                  />
                )}
              />
              <Controller
                name="cpu_max_in_milli"
                control={control}
                render={({ field }) => (
                  <InputText
                    name={field.name}
                    label="CPU (millicores)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                    placeholder={defaultAdvancedSettings?.['build.cpu_max_in_milli']?.toString()}
                  />
                )}
              />
              <Controller
                name="ram_max_in_gib"
                control={control}
                render={({ field }) => (
                  <InputText
                    name={field.name}
                    label="RAM (GiB)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                    placeholder={defaultAdvancedSettings?.['build.ram_max_in_gib']?.toString()}
                  />
                )}
              />
              <Controller
                name="ephemeral_storage_in_gib"
                control={control}
                render={({ field }) => (
                  <InputText
                    name={field.name}
                    label="Ephemeral storage (GiB)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                    placeholder={defaultAdvancedSettings?.['build.ephemeral_storage_in_gib']?.toString()}
                  />
                )}
              />
              {!isTerraform && (
                <Controller
                  name="disable_buildkit_cache"
                  control={control}
                  render={({ field }) => (
                    <InputToggle
                      small
                      value={field.value}
                      onChange={field.onChange}
                      disabled={disabled}
                      title="Disable BuildKit cache"
                      description="When enabled, the build will not use the BuildKit registry cache layer, forcing a full rebuild every time."
                    />
                  )}
                />
              )}
              <Controller
                name="skip_git_submodules"
                control={control}
                render={({ field }) => (
                  <InputToggle
                    small
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                    title="Skip Git submodules"
                    description="When enabled, git submodules will not be initialized or updated during the repository clone step."
                  />
                )}
              />
            </div>
            {!disabled && (
              <div className="flex justify-end">
                <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
                  Save
                </Button>
              </div>
            )}
          </form>
        </div>
      </Section>
    </div>
  )
}

function ServiceBuildSettingsContent() {
  useDocumentTitle('Build settings - Service settings')
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (!service || !isBuildSettingsServiceType(service.serviceType)) {
    return <p className="p-8 text-sm text-neutral-subtle">Build settings are not available for this service type.</p>
  }

  return (
    <ServiceBuildSettingsForm
      service={service as BuildSettingsService}
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
      serviceId={serviceId}
    />
  )
}

interface ServiceBuildSettingsFormProps {
  service: BuildSettingsService
  organizationId: string
  projectId: string
  environmentId: string
  serviceId: string
}

function ServiceBuildSettingsForm({
  service,
  organizationId,
  projectId,
  environmentId,
  serviceId,
}: ServiceBuildSettingsFormProps) {
  const { data: advancedSettings } = useAdvancedSettings({
    serviceId,
    serviceType: service.serviceType,
    suspense: true,
  })

  const { data: defaultAdvancedSettings } = useDefaultAdvancedSettings({
    serviceType: service.serviceType,
    suspense: true,
  })

  const { mutate: editService, isLoading } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<BuildSettingsFormData>({
    mode: 'onChange',
    defaultValues: getDefaultValues(
      advancedSettings as Record<string, unknown> | undefined,
      defaultAdvancedSettings as Record<string, unknown> | undefined
    ),
  })

  useEffect(() => {
    methods.reset(
      getDefaultValues(
        advancedSettings as Record<string, unknown> | undefined,
        defaultAdvancedSettings as Record<string, unknown> | undefined
      )
    )
  }, [serviceId, advancedSettings, defaultAdvancedSettings, methods])

  const isTerraform = service.serviceType === 'TERRAFORM'
  const buildSettingsEditable =
    (service as BuildSettingsService & { build_settings_editable?: boolean }).build_settings_editable ?? false

  const onSubmit = methods.handleSubmit((data) => {
    const buildSettings: Record<string, unknown> = {
      timeout_max_sec: toNumberOrNull(data.timeout_max_sec),
      cpu_max_in_milli: toNumberOrNull(data.cpu_max_in_milli),
      ram_max_in_gib: toNumberOrNull(data.ram_max_in_gib),
      ephemeral_storage_in_gib: toNumberOrNull(data.ephemeral_storage_in_gib),
      skip_git_submodules: data.skip_git_submodules,
    }

    if (!isTerraform) {
      buildSettings.disable_buildkit_cache = data.disable_buildkit_cache
    }

    const payload = buildEditServicePayload({
      service,
      request: { build_settings: buildSettings },
    } as Parameters<typeof buildEditServicePayload>[0])

    editService({ serviceId, payload }, { onSuccess: () => methods.reset(data) })
  })

  return (
    <FormProvider {...methods}>
      <BuildSettingsForm
        service={service}
        onSubmit={onSubmit}
        loading={isLoading}
        disabled={!buildSettingsEditable}
        defaultAdvancedSettings={defaultAdvancedSettings as Record<string, unknown> | undefined}
      />
    </FormProvider>
  )
}

const BuildSettingsFallback = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

export function ServiceBuildSettings() {
  return (
    <Suspense fallback={<BuildSettingsFallback />}>
      <ServiceBuildSettingsContent />
    </Suspense>
  )
}

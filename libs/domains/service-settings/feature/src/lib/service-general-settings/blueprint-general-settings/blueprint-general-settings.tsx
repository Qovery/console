import * as Dialog from '@radix-ui/react-dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type BlueprintConfigurationVariable,
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
} from 'qovery-typescript-axios'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type BlueprintService } from '@qovery/domains/services/data-access'
import {
  type BlueprintFieldValue,
  BlueprintManifestVariableInput,
  BlueprintMetadata,
  BlueprintMetadataSkeleton,
  BlueprintPreview,
  BlueprintSection,
  OverridesSectionCard,
  formatBlueprintName,
  getDefaultFieldValue,
  getFallbackServiceIcon,
  getFieldValidationError,
  isFieldValid,
  isOptionalVariableField,
  isRequiredVariableField,
  useBlueprint,
  useBlueprintCatalogServiceManifest,
  useBlueprintVariables,
  useDeployBlueprint,
  usePreviewBlueprintUpdate,
  useUpdateBlueprint,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, LoaderSpinner, Section, toast, useModal } from '@qovery/shared/ui'

interface BlueprintSettingsDetails {
  name: string
  tag: string
  manifest?: {
    results: BlueprintManifestResponseResultsInner[]
  }
}

interface OptimisticBlueprintSettings {
  values: Record<string, BlueprintFieldValue>
  secretNames: string[]
}

interface BlueprintGeneralSettingsProps {
  service: BlueprintService
  environmentId: string
  organizationId: string
}

const EMPTY_OPTIMISTIC_BLUEPRINT_SETTINGS: OptimisticBlueprintSettings = {
  values: {},
  secretNames: [],
}
const OPTIMISTIC_BLUEPRINT_SETTINGS_CACHE_TIME_MS = 30 * 60 * 1000

function getOptimisticBlueprintSettingsQueryKey(serviceId: string) {
  return ['blueprint-settings', serviceId, 'optimistic-values'] as const
}

function isBlueprintSettingsDetails(data: unknown): data is BlueprintSettingsDetails {
  if (!data || typeof data !== 'object') return false

  const details = data as Partial<BlueprintSettingsDetails>
  return (
    typeof details.name === 'string' &&
    typeof details.tag === 'string' &&
    (details.manifest === undefined || (details.manifest !== null && Array.isArray(details.manifest.results)))
  )
}

function parseBlueprintTag(tag: string | undefined) {
  const [provider = '', serviceFamily = '', serviceVersion = ''] = tag?.split('/') ?? []
  return { provider, serviceFamily, serviceVersion }
}

function getBlueprintGitRepository(service: BlueprintService) {
  return service.serviceType === 'TERRAFORM' ? service.terraform_files_source?.git?.git_repository : undefined
}

function useOptimisticBlueprintSettings({
  serviceId,
  persistedVariables,
}: {
  serviceId: string
  persistedVariables: Map<string, BlueprintConfigurationVariable>
}) {
  const queryClient = useQueryClient()
  const queryKey = useMemo(() => getOptimisticBlueprintSettingsQueryKey(serviceId), [serviceId])
  const { data: optimisticSettings = EMPTY_OPTIMISTIC_BLUEPRINT_SETTINGS } = useQuery({
    queryKey,
    queryFn: () => EMPTY_OPTIMISTIC_BLUEPRINT_SETTINGS,
    enabled: false,
    cacheTime: OPTIMISTIC_BLUEPRINT_SETTINGS_CACHE_TIME_MS,
  })

  const update = useCallback(
    (settings: OptimisticBlueprintSettings) => {
      queryClient.setQueryData<OptimisticBlueprintSettings>(queryKey, (currentSettings) => ({
        values: { ...currentSettings?.values, ...settings.values },
        secretNames: [...new Set([...(currentSettings?.secretNames ?? []), ...settings.secretNames])],
      }))
    },
    [queryClient, queryKey]
  )

  const remove = useCallback(
    (settings: OptimisticBlueprintSettings) => {
      queryClient.setQueryData<OptimisticBlueprintSettings>(queryKey, (currentSettings) => {
        if (!currentSettings) return EMPTY_OPTIMISTIC_BLUEPRINT_SETTINGS

        return {
          values: Object.fromEntries(
            Object.entries(currentSettings.values).filter(([name, value]) => settings.values[name] !== value)
          ),
          secretNames: currentSettings.secretNames.filter((name) => !settings.secretNames.includes(name)),
        }
      })
    },
    [queryClient, queryKey]
  )

  useEffect(() => {
    const remainingValues = Object.fromEntries(
      Object.entries(optimisticSettings.values).filter(
        ([name, value]) => persistedVariables.get(name)?.value !== String(value)
      )
    ) as Record<string, BlueprintFieldValue>
    const remainingSecretNames = optimisticSettings.secretNames.filter(
      (name) => !persistedVariables.get(name)?.is_secret
    )

    if (
      Object.keys(remainingValues).length !== Object.keys(optimisticSettings.values).length ||
      remainingSecretNames.length !== optimisticSettings.secretNames.length
    ) {
      queryClient.setQueryData<OptimisticBlueprintSettings>(queryKey, {
        values: remainingValues,
        secretNames: remainingSecretNames,
      })
    }
  }, [optimisticSettings, persistedVariables, queryClient, queryKey])

  return { optimisticSettings, update, remove }
}

export function BlueprintGeneralSettings(props: BlueprintGeneralSettingsProps) {
  return (
    <Suspense fallback={<LoaderSpinner className="mx-auto my-12" />}>
      <BlueprintGeneralSettingsContent {...props} />
    </Suspense>
  )
}

function BlueprintGeneralSettingsContent({ service, environmentId, organizationId }: BlueprintGeneralSettingsProps) {
  const { closeModal, openModal } = useModal()
  const { data, isLoading } = useBlueprint({ blueprintId: service.blueprint_id })
  const { data: persistedVariables = [], isLoading: isVariablesLoading } = useBlueprintVariables({
    blueprintId: service.blueprint_id,
  })
  const { data: environment } = useEnvironment({ environmentId })
  const { mutateAsync: previewBlueprintUpdate, isLoading: isPreviewLoading } = usePreviewBlueprintUpdate()
  const { mutateAsync: updateBlueprint, isLoading: isUpdateLoading } = useUpdateBlueprint({
    environmentId,
    serviceId: service.id,
    serviceType: service.serviceType,
  })
  const { mutateAsync: deployBlueprint, isLoading: isDeployLoading } = useDeployBlueprint({
    environmentId,
    serviceId: service.id,
    serviceType: service.serviceType,
  })
  const [changes, setChanges] = useState<Record<string, BlueprintFieldValue>>({})
  const [step, setStep] = useState<'review' | 'preview'>('review')
  const [previewId, setPreviewId] = useState<string>()
  const [previewError, setPreviewError] = useState(false)

  const details = isBlueprintSettingsDetails(data) ? data : undefined
  const { provider, serviceFamily, serviceVersion } = parseBlueprintTag(details?.tag)
  const manifestFields = details?.manifest?.results
  const isCatalogManifestEnabled = Boolean(details && !manifestFields)
  const { data: catalogFields = [], isLoading: isCatalogManifestLoading } = useBlueprintCatalogServiceManifest({
    organizationId,
    provider,
    serviceFamily,
    serviceVersion,
    environmentId,
    enabled: isCatalogManifestEnabled,
  })
  const fields = manifestFields ?? catalogFields
  const variablesByName = useMemo(
    () => new Map(persistedVariables.map((variable) => [variable.name, variable])),
    [persistedVariables]
  )
  const {
    optimisticSettings: { values: optimisticChanges, secretNames: optimisticSecretNames },
    update: updateOptimisticSettings,
    remove: removeOptimisticSettings,
  } = useOptimisticBlueprintSettings({ serviceId: service.id, persistedVariables: variablesByName })
  const manifestVariablesByName = useMemo(
    () =>
      new Map(
        fields
          .filter((field): field is BlueprintManifestVariableField => field.kind === 'variable')
          .map((field) => [field.name, field])
      ),
    [fields]
  )
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        fields
          .filter((field): field is BlueprintManifestVariableField => field.kind === 'variable')
          .map((field) => {
            const persistedVariable = variablesByName.get(field.name)
            const persistedValue = persistedVariable?.value
            return [
              field.name,
              persistedVariable?.is_secret
                ? ''
                : field.type.type === 'bool' && persistedValue !== null && persistedValue !== undefined
                  ? persistedValue === 'true'
                  : persistedValue ?? getDefaultFieldValue(field),
            ]
          })
      ),
    [fields, variablesByName]
  )
  const values = useMemo(
    () => ({ ...initialValues, ...optimisticChanges, ...changes }),
    [changes, initialValues, optimisticChanges]
  )
  const requiredFields = fields.filter(isRequiredVariableField)
  const optionalFields = fields.filter(isOptionalVariableField)
  const formValueSources = useMemo(
    () =>
      fields
        .filter((field): field is BlueprintManifestVariableField => field.kind === 'variable')
        .map((field) => {
          const persistedVariable = variablesByName.get(field.name)

          return {
            field: field.name,
            schema: manifestFields ? 'useBlueprint -> response.manifest.results' : 'useBlueprintCatalogServiceManifest',
            value:
              field.name in changes
                ? 'local useState(changes)'
                : field.name in optimisticChanges
                  ? 'React Query optimistic Blueprint Settings cache'
                  : persistedVariable
                    ? 'useBlueprintVariables -> response[]'
                    : 'getDefaultFieldValue(field)',
            isSecret: field.is_secret,
            hasValue: values[field.name] !== undefined && values[field.name] !== '',
          }
        }),
    [changes, fields, manifestFields, optimisticChanges, values, variablesByName]
  )
  const blueprintEndpoint = `/blueprint/${encodeURIComponent(service.blueprint_id)}`
  const serviceEndpoint =
    service.serviceType === 'HELM'
      ? `/helm/${encodeURIComponent(service.id)}`
      : `/terraform/${encodeURIComponent(service.id)}`
  const catalogManifestEndpoint = `/organization/${encodeURIComponent(
    organizationId
  )}/blueprint/catalog/${encodeURIComponent(provider)}/${encodeURIComponent(serviceFamily)}/${encodeURIComponent(
    serviceVersion
  )}/manifest?environmentId=${encodeURIComponent(environmentId)}`

  useEffect(() => {
    console.groupCollapsed('Blueprint configuration form data sources')
    console.table([
      {
        hook: 'useService (settings route)',
        endpoint: `GET ${serviceEndpoint}`,
        enabled: true,
        provides: 'Service prop for identity and metadata; it does not provide form field values',
      },
      {
        hook: 'useBlueprint',
        endpoint: `GET ${blueprintEndpoint}`,
        enabled: true,
        provides: 'Blueprint details and manifest fields',
      },
      {
        hook: 'useBlueprintVariables',
        endpoint: `GET ${blueprintEndpoint}/variables`,
        enabled: true,
        provides: 'Persisted Blueprint variables; secret values are omitted by the API',
      },
      {
        hook: 'useBlueprintCatalogServiceManifest',
        endpoint: `GET ${catalogManifestEndpoint}`,
        enabled: isCatalogManifestEnabled,
        provides: 'Catalog manifest fields only; used when useBlueprint has no manifest',
      },
    ])
    console.table(formValueSources)
    console.log('useService (settings route) payload', service)
    console.log('useBlueprint payload', data)
    console.log('useBlueprintVariables payload', persistedVariables)
    console.log('useBlueprintCatalogServiceManifest payload', catalogFields)
    console.log('React Query optimistic Blueprint Settings payload', optimisticChanges)
    console.log('local useState(changes) payload', changes)
    console.log('computed Blueprint form values payload', values)
    console.groupEnd()
  }, [
    blueprintEndpoint,
    catalogFields,
    catalogManifestEndpoint,
    changes,
    data,
    formValueSources,
    isCatalogManifestEnabled,
    optimisticChanges,
    persistedVariables,
    service,
    serviceEndpoint,
    values,
  ])
  const isValid = requiredFields.every(
    (field) =>
      isFieldValid(field, values[field.name]) ||
      (field.is_secret &&
        (variablesByName.get(field.name)?.is_secret || optimisticSecretNames.includes(field.name)) &&
        changes[field.name] === undefined)
  )
  const isSaving = isUpdateLoading || isDeployLoading

  const closePreview = useCallback(() => {
    closeModal()
    setStep('review')
  }, [closeModal])

  const payload = useMemo(() => {
    const variables = Object.fromEntries(
      Object.entries(changes).map(([name, value]) => [
        name,
        { value: String(value), is_secret: manifestVariablesByName.get(name)?.is_secret ?? false },
      ])
    )

    return details
      ? {
          name: details.name,
          tag: details.tag,
          icon: service.icon_uri ?? getFallbackServiceIcon(service.service_type),
          variables,
        }
      : undefined
  }, [changes, details, manifestVariablesByName, service.icon_uri, service.service_type])

  const requestPreview = useCallback(async () => {
    if (!payload || !isValid) return

    setPreviewError(false)
    setPreviewId(undefined)
    setStep('preview')

    try {
      const preview = await previewBlueprintUpdate({ blueprintId: service.blueprint_id, payload })
      setPreviewId(preview?.preview_id)
    } catch {
      setPreviewError(true)
    }
  }, [isValid, payload, previewBlueprintUpdate, service.blueprint_id])

  const confirmAndDeploy = useCallback(async () => {
    if (!details || !isValid) return
    if (!payload) return

    const confirmedSecretNames = Object.keys(changes).filter((name) => manifestVariablesByName.get(name)?.is_secret)
    const confirmedChanges = Object.fromEntries(
      Object.entries(changes).filter(([name]) => !confirmedSecretNames.includes(name))
    ) as Record<string, BlueprintFieldValue>

    const confirmedSettings = { values: confirmedChanges, secretNames: confirmedSecretNames }
    updateOptimisticSettings(confirmedSettings)
    setChanges({})
    closePreview()

    try {
      await updateBlueprint({ blueprintId: service.blueprint_id, payload })
      await deployBlueprint({ blueprintId: service.blueprint_id })
      toast('success', 'Blueprint update started')
    } catch {
      removeOptimisticSettings(confirmedSettings)
    }
  }, [
    changes,
    closePreview,
    deployBlueprint,
    details,
    isValid,
    manifestVariablesByName,
    payload,
    removeOptimisticSettings,
    service.blueprint_id,
    updateOptimisticSettings,
    updateBlueprint,
  ])

  useEffect(() => {
    if (step !== 'preview') return

    openModal({
      content: (
        <>
          <Dialog.Title className="sr-only">Preview changes</Dialog.Title>
          <BlueprintPreview
            clusterId={environment?.cluster_id}
            previewId={previewId}
            previewError={previewError}
            loading={isSaving}
            layout="modal"
            onBack={closePreview}
            onConfirm={confirmAndDeploy}
            onRetry={requestPreview}
          />
        </>
      ),
      options: {
        buttonClose: false,
        dismissible: false,
        height: 'min(65vh, 680px)',
        width: 'min(50vw, 900px)',
      },
    })
  }, [
    closePreview,
    confirmAndDeploy,
    environment?.cluster_id,
    isSaving,
    openModal,
    previewError,
    previewId,
    requestPreview,
    step,
  ])

  if (isLoading || isVariablesLoading || (details && !manifestFields && isCatalogManifestLoading)) {
    return <LoaderSpinner className="mx-auto my-12" />
  }

  if (!details) {
    return (
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading
          title="Blueprint configuration"
          description="Configure the inputs defined by this Blueprint."
        />
        <Section className="max-w-content-with-navigation-left p-4">
          <p className="text-sm text-neutral">Blueprint configuration is unavailable.</p>
          <p className="mt-1 text-sm text-neutral-subtle">
            The Blueprint details could not be loaded. Try again in a moment.
          </p>
        </Section>
      </Section>
    )
  }

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title="Blueprint configuration" description="Configure the inputs defined by this Blueprint." />
      <div className="max-w-content-with-navigation-left space-y-3">
        <BlueprintSection active iconName="circle-info" title="Service information">
          <p className="text-sm text-neutral-subtle">{formatBlueprintName(details.name)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <Suspense fallback={<BlueprintMetadataSkeleton gitRepository={getBlueprintGitRepository(service)} />}>
              <BlueprintMetadata
                blueprintId={service.blueprint_id}
                gitRepository={getBlueprintGitRepository(service)}
                service={service}
              />
            </Suspense>
          </div>
        </BlueprintSection>
        <BlueprintSection active iconName="chart-bullet" title="Blueprint setup">
          {requiredFields.map((field, index) => (
            <BlueprintManifestVariableInput
              key={field.name}
              autoFocus={index === 0}
              error={getFieldValidationError(field, values[field.name])}
              field={field}
              value={values[field.name]}
              onChange={(value) => setChanges((current) => ({ ...current, [field.name]: value }))}
            />
          ))}
        </BlueprintSection>
        <OverridesSectionCard active disabled={optionalFields.length === 0} onClick={() => undefined}>
          {optionalFields.map((field) => (
            <BlueprintManifestVariableInput
              key={field.name}
              error={getFieldValidationError(field, values[field.name])}
              field={field}
              value={values[field.name]}
              onChange={(value) => setChanges((current) => ({ ...current, [field.name]: value }))}
            />
          ))}
        </OverridesSectionCard>
        <div className="flex justify-end pt-6">
          <Button
            type="button"
            size="lg"
            loading={isPreviewLoading}
            disabled={!isValid || Object.keys(changes).length === 0}
            onClick={() => void requestPreview()}
          >
            Preview changes
          </Button>
        </div>
      </div>
    </Section>
  )
}

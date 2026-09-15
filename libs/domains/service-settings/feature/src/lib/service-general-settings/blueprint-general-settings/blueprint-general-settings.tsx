import * as Dialog from '@radix-ui/react-dialog'
import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type BlueprintService } from '@qovery/domains/services/data-access'
import {
  type BlueprintFieldValue,
  BlueprintManifestVariableInput,
  BlueprintPreview,
  BlueprintSection,
  OverridesSectionCard,
  getDefaultFieldValue,
  getFallbackServiceIcon,
  getFieldValidationError,
  isFieldValid,
  isOptionalVariableField,
  isRequiredVariableField,
  useBlueprint,
  useBlueprintCatalogServiceManifest,
  useDeployBlueprint,
  usePreviewBlueprintUpdate,
  useUpdateBlueprint,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, LoaderSpinner, Section, toast, useModal } from '@qovery/shared/ui'

interface PersistedVariable {
  name: string
  value: string | null
  is_secret: boolean
}

interface BlueprintSettingsDetails {
  name: string
  tag: string
}

interface BlueprintGeneralSettingsProps {
  service: BlueprintService
  environmentId: string
  organizationId: string
}

function isBlueprintSettingsDetails(data: unknown): data is BlueprintSettingsDetails {
  console.log('data', data)
  if (!data || typeof data !== 'object') return false

  const details = data as Partial<BlueprintSettingsDetails>
  return typeof details.name === 'string' && typeof details.tag === 'string'
}

function parseBlueprintTag(tag: string | undefined) {
  const [provider = '', serviceFamily = '', serviceVersion = ''] = tag?.split('/') ?? []
  return { provider, serviceFamily, serviceVersion }
}

function getPersistedVariables(service: BlueprintService): PersistedVariable[] {
  if (service.serviceType !== 'TERRAFORM') return []

  return service.terraform_variables_source.tf_vars.flatMap((variable) =>
    variable.key
      ? [
          {
            name: variable.key,
            value: variable.secret ? null : variable.value ?? null,
            is_secret: variable.secret ?? false,
          },
        ]
      : []
  )
}

export function BlueprintGeneralSettings({ service, environmentId, organizationId }: BlueprintGeneralSettingsProps) {
  const { closeModal, openModal } = useModal()
  const { data, isLoading } = useBlueprint({ blueprintId: service.blueprint_id })
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
  const { data: fields = [], isLoading: isManifestLoading } = useBlueprintCatalogServiceManifest({
    organizationId,
    provider,
    serviceFamily,
    serviceVersion,
    environmentId,
    enabled: Boolean(details),
  })
  const variablesByName = useMemo(
    () => new Map(getPersistedVariables(service).map((variable) => [variable.name, variable])),
    [service]
  )
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
  const values = { ...initialValues, ...changes }
  const requiredFields = fields.filter(isRequiredVariableField)
  const optionalFields = fields.filter(isOptionalVariableField)
  const isValid = requiredFields.every(
    (field) =>
      isFieldValid(field, values[field.name]) ||
      (field.is_secret && variablesByName.get(field.name)?.is_secret && changes[field.name] === undefined)
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

    await updateBlueprint({ blueprintId: service.blueprint_id, payload })
    await deployBlueprint({ blueprintId: service.blueprint_id })
    setChanges({})
    closePreview()
    toast('success', 'Blueprint update started')
  }, [closePreview, deployBlueprint, details, isValid, payload, service.blueprint_id, updateBlueprint])

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

  if (isLoading || (details && isManifestLoading)) {
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
          <p className="text-sm text-neutral-subtle">{details.name}</p>
          <p className="text-sm text-neutral-subtle">{details.tag}</p>
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

import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { type BlueprintCreateRequest } from 'qovery-typescript-axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LogsType } from '@qovery/shared/enums'
import { Button, FunnelFlowBody, Heading, Icon, Section, SummaryValue, toast } from '@qovery/shared/ui'
import {
  formatFieldLabel,
  getSummaryFieldValue,
  isFieldValid,
} from '../../../blueprint-field-utils/blueprint-field-utils'
import { formatBlueprintName } from '../../../blueprint-utils/blueprint-utils'
import { useBlueprintCreationLogs } from '../../../hooks/use-blueprint-creation-logs/use-blueprint-creation-logs'
import { useBlueprintServiceCreatedSocket } from '../../../hooks/use-blueprint-service-created-socket/use-blueprint-service-created-socket'
import { useCreateBlueprint } from '../../../hooks/use-create-blueprint/use-create-blueprint'
import { useEnvironment } from '../../../hooks/use-environment/use-environment'
import { useBlueprintCreateContext } from '../blueprint-create-context/blueprint-create-context'
import { buildBlueprintVariables } from '../blueprint-creation-utils/blueprint-creation-utils'
import { useBlueprintManifestFields } from '../blueprint-manifest-context/blueprint-manifest-context'
import { BlueprintCreationLoadingModal } from './blueprint-creation-loading-modal/blueprint-creation-loading-modal'

type BlueprintConfigurationSection = 'service-information' | 'blueprint-setup' | 'overrides'
type PendingBlueprintCreation = {
  deploy: boolean
  payload: BlueprintCreateRequest
}

const BLUEPRINT_SERVICE_CREATED_FALLBACK_TIMEOUT_MS = 30_000

export function BlueprintStepSummary() {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { blueprint, creationFlowUrl, form, serviceVersion, setCurrentStep } = useBlueprintCreateContext()
  const { optionalBlueprintFields, overridableContextBlueprintFields, requiredBlueprintFields } =
    useBlueprintManifestFields()
  const [submitMode, setSubmitMode] = useState<'create' | 'create-and-deploy' | null>(null)
  const [isWaitingForServiceCreated, setIsWaitingForServiceCreated] = useState(false)
  const [isBlueprintCreationFailed, setIsBlueprintCreationFailed] = useState(false)
  const [createdBlueprintId, setCreatedBlueprintId] = useState<string>()
  const [pendingBlueprintCreation, setPendingBlueprintCreation] = useState<PendingBlueprintCreation | null>(null)
  const [lastBlueprintCreation, setLastBlueprintCreation] = useState<PendingBlueprintCreation | null>(null)
  const hasHandledServiceCreatedRef = useRef(false)
  const hasBlueprintCreationErrorRef = useRef(false)
  const hasStartedBlueprintCreationRef = useRef(false)
  const serviceCreatedFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { mutateAsync: createBlueprint } = useCreateBlueprint()
  const { data: environment } = useEnvironment({ environmentId })
  const { fields, serviceName } = form.watch()
  const variableFields = [...requiredBlueprintFields, ...optionalBlueprintFields]
  const overrideFields = [...optionalBlueprintFields, ...overridableContextBlueprintFields]
  const blueprintFields = [...variableFields, ...overridableContextBlueprintFields]
  const isBlueprintSetupValid = requiredBlueprintFields.every((field) => isFieldValid(field, fields[field.name]))
  const { logs: blueprintCreationLogs } = useBlueprintCreationLogs({
    blueprintId: createdBlueprintId,
    clusterId: environment?.cluster_id,
    environmentId,
    organizationId,
    projectId,
    enabled: isWaitingForServiceCreated && !isBlueprintCreationFailed,
  })
  const hasBlueprintCreationError =
    Boolean(createdBlueprintId) && blueprintCreationLogs.some((log) => log.type === LogsType.ERROR)

  const handleEditSection = (section: BlueprintConfigurationSection) => {
    navigate({ to: `${creationFlowUrl}/${section}` })
  }

  const navigateToEnvironmentOverview = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId,
        projectId,
        environmentId,
      },
    })
  }, [environmentId, navigate, organizationId, projectId])

  const clearServiceCreatedFallbackTimeout = useCallback(() => {
    if (!serviceCreatedFallbackTimeoutRef.current) {
      return
    }

    clearTimeout(serviceCreatedFallbackTimeoutRef.current)
    serviceCreatedFallbackTimeoutRef.current = null
  }, [])

  const handleBlueprintServiceCreated = useCallback(() => {
    if (hasHandledServiceCreatedRef.current || hasBlueprintCreationErrorRef.current) {
      return
    }

    hasHandledServiceCreatedRef.current = true
    clearServiceCreatedFallbackTimeout()
    setIsWaitingForServiceCreated(false)
    setSubmitMode(null)
    toast('success', 'Your service has been created')
    navigateToEnvironmentOverview()
  }, [clearServiceCreatedFallbackTimeout, navigateToEnvironmentOverview])

  const startServiceCreatedFallbackTimeout = useCallback(() => {
    if (hasHandledServiceCreatedRef.current) {
      return
    }

    clearServiceCreatedFallbackTimeout()
    serviceCreatedFallbackTimeoutRef.current = setTimeout(() => {
      handleBlueprintServiceCreated()
    }, BLUEPRINT_SERVICE_CREATED_FALLBACK_TIMEOUT_MS)
  }, [clearServiceCreatedFallbackTimeout, handleBlueprintServiceCreated])

  useBlueprintServiceCreatedSocket({
    organizationId,
    projectId,
    environmentId,
    enabled: isWaitingForServiceCreated && !isBlueprintCreationFailed,
    onServiceCreated: handleBlueprintServiceCreated,
  })

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  useEffect(() => () => clearServiceCreatedFallbackTimeout(), [clearServiceCreatedFallbackTimeout])

  useEffect(() => {
    if (!hasBlueprintCreationError) {
      return
    }

    hasBlueprintCreationErrorRef.current = true
    clearServiceCreatedFallbackTimeout()
    setPendingBlueprintCreation(null)
    setIsWaitingForServiceCreated(false)
    setIsBlueprintCreationFailed(true)
    setSubmitMode(null)
  }, [clearServiceCreatedFallbackTimeout, hasBlueprintCreationError])

  useEffect(() => {
    if (!serviceName.trim() || !isBlueprintSetupValid) {
      navigate({ to: `${creationFlowUrl}/blueprint-setup` })
      return
    }
  }, [creationFlowUrl, isBlueprintSetupValid, navigate, serviceName])

  useEffect(() => {
    if (!pendingBlueprintCreation || !isWaitingForServiceCreated || hasStartedBlueprintCreationRef.current) {
      return
    }

    let shouldUpdateState = true
    const blueprintCreation = pendingBlueprintCreation
    hasStartedBlueprintCreationRef.current = true

    async function createPendingBlueprint() {
      try {
        const createdBlueprint = await createBlueprint({
          environmentId,
          deploy: blueprintCreation.deploy,
          payload: blueprintCreation.payload,
        })

        if (!shouldUpdateState) {
          return
        }

        setCreatedBlueprintId(createdBlueprint.id)
        posthog.capture('create-service', {
          selectedServiceType: 'blueprint',
          selectedServiceSubType: blueprint.serviceFamily ?? blueprint.provider,
        })
        setPendingBlueprintCreation(null)
        startServiceCreatedFallbackTimeout()
      } catch {
        if (!shouldUpdateState) {
          return
        }

        // errors are surfaced by mutation notifications
        clearServiceCreatedFallbackTimeout()
        hasStartedBlueprintCreationRef.current = false
        setPendingBlueprintCreation(null)
        setIsWaitingForServiceCreated(false)
        setSubmitMode(null)
      }
    }

    createPendingBlueprint()

    return () => {
      shouldUpdateState = false
    }
  }, [
    blueprint.provider,
    blueprint.serviceFamily,
    clearServiceCreatedFallbackTimeout,
    createBlueprint,
    environmentId,
    isWaitingForServiceCreated,
    pendingBlueprintCreation,
    startServiceCreatedFallbackTimeout,
  ])

  const handleSubmit = (withDeploy: boolean) => {
    const formValues = form.getValues()
    const blueprintCreation = {
      deploy: withDeploy,
      payload: {
        name: formValues.serviceName,
        tag: formValues.versionTag,
        icon: blueprint.icon,
        variables: buildBlueprintVariables(formValues.fields, blueprintFields),
      },
    }

    setSubmitMode(withDeploy ? 'create-and-deploy' : 'create')
    clearServiceCreatedFallbackTimeout()
    hasHandledServiceCreatedRef.current = false
    hasBlueprintCreationErrorRef.current = false
    hasStartedBlueprintCreationRef.current = false
    setCreatedBlueprintId(undefined)
    setIsBlueprintCreationFailed(false)
    setLastBlueprintCreation(blueprintCreation)
    setIsWaitingForServiceCreated(true)

    setPendingBlueprintCreation(blueprintCreation)
  }

  const handleRetry = () => {
    if (!lastBlueprintCreation) return

    clearServiceCreatedFallbackTimeout()
    hasHandledServiceCreatedRef.current = false
    hasBlueprintCreationErrorRef.current = false
    hasStartedBlueprintCreationRef.current = false
    setCreatedBlueprintId(undefined)
    setIsBlueprintCreationFailed(false)
    setSubmitMode(lastBlueprintCreation.deploy ? 'create-and-deploy' : 'create')
    setIsWaitingForServiceCreated(true)

    setPendingBlueprintCreation(lastBlueprintCreation)
  }

  const handleEditConfig = () => {
    clearServiceCreatedFallbackTimeout()
    hasBlueprintCreationErrorRef.current = false
    setIsWaitingForServiceCreated(false)
    setIsBlueprintCreationFailed(false)
    setSubmitMode(null)
    navigate({ to: `${creationFlowUrl}/service-information` })
  }

  return (
    <>
      <FunnelFlowBody customContentWidth="max-w-[1024px]">
        <Section className="space-y-10">
          <div className="flex flex-col gap-2">
            <Heading className="mb-2">Ready to create your blueprint service</Heading>
            <p className="text-sm text-neutral-subtle">
              Review the configuration generated from the selected blueprint before creating the service.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
              <div className="flex justify-between">
                <Heading>Service information</Heading>
                <Button
                  aria-label="Edit service information"
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="md"
                  onClick={() => handleEditSection('service-information')}
                  iconOnly
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                <SummaryValue label="Name" value={serviceName} />
                <SummaryValue label="Blueprint" value={formatBlueprintName(blueprint.name)} />
                <SummaryValue label="Version" value={serviceVersion} />
              </ul>
            </Section>

            {requiredBlueprintFields.length > 0 && (
              <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
                <div className="flex justify-between">
                  <Heading>Blueprint setup</Heading>
                  <Button
                    aria-label="Edit blueprint setup"
                    type="button"
                    variant="outline"
                    color="neutral"
                    size="md"
                    onClick={() => handleEditSection('blueprint-setup')}
                    iconOnly
                  >
                    <Icon className="text-base" iconName="gear-complex" />
                  </Button>
                </div>
                <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                  {requiredBlueprintFields.map((field) => (
                    <SummaryValue
                      key={field.name}
                      label={formatFieldLabel(field.name)}
                      value={getSummaryFieldValue(field, fields[field.name])}
                    />
                  ))}
                </ul>
              </Section>
            )}

            <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
              <div className="flex justify-between">
                <Heading>Overrides</Heading>
                <Button
                  aria-label="Edit overrides"
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="md"
                  onClick={() => handleEditSection('overrides')}
                  iconOnly
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              {overrideFields.length > 0 ? (
                <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                  {overrideFields.map((field) => (
                    <SummaryValue
                      key={field.name}
                      label={formatFieldLabel(field.name)}
                      value={getSummaryFieldValue(field, fields[field.name])}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-subtle">No overrides configured.</p>
              )}
            </Section>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => navigate({ to: `${creationFlowUrl}/overrides` })}
              type="button"
              size="lg"
              variant="plain"
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                data-testid="button-create"
                loading={submitMode === 'create'}
                onClick={() => handleSubmit(false)}
                size="lg"
                type="button"
                variant="outline"
              >
                Create
              </Button>
              <Button
                data-testid="button-create-deploy"
                loading={submitMode === 'create-and-deploy'}
                onClick={() => handleSubmit(true)}
                type="button"
                size="lg"
              >
                Create and deploy
              </Button>
            </div>
          </div>
        </Section>
      </FunnelFlowBody>
      <BlueprintCreationLoadingModal
        logs={blueprintCreationLogs}
        onEditConfig={handleEditConfig}
        onRetry={handleRetry}
        open={blueprintCreationLogs.length > 0 && (isWaitingForServiceCreated || isBlueprintCreationFailed)}
        serviceName={serviceName}
      />
    </>
  )
}

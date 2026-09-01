import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { type BlueprintCreateRequest } from 'qovery-typescript-axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { match } from 'ts-pattern'
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
import { useBlueprint } from '../../../hooks/use-blueprint/use-blueprint'
import { useCreateBlueprint } from '../../../hooks/use-create-blueprint/use-create-blueprint'
import { useEnvironment } from '../../../hooks/use-environment/use-environment'
import { useBlueprintCreateContext } from '../blueprint-create-context/blueprint-create-context'
import {
  buildBlueprintVariables,
  resolveBlueprintCreationOutcome,
} from '../blueprint-creation-utils/blueprint-creation-utils'
import { useBlueprintManifestFields } from '../blueprint-manifest-context/blueprint-manifest-context'
import { BlueprintCreationLoadingModal } from './blueprint-creation-loading-modal/blueprint-creation-loading-modal'

type BlueprintConfigurationSection = 'service-information' | 'blueprint-setup' | 'overrides'
type PendingBlueprintCreation = {
  deploy: boolean
  payload: BlueprintCreateRequest
}

const BLUEPRINT_STATUS_POLL_INTERVAL_MS = 5_000
const BLUEPRINT_STATUS_POLL_TIMEOUT_MS = 300_000
const BLUEPRINT_STATUS_POLL_TIMEOUT_MESSAGE =
  'Timed out while waiting for this blueprint to report its status. Check the environment before retrying.'

export function BlueprintStepSummary() {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { blueprint, creationFlowUrl, form, serviceVersion, setCurrentStep } = useBlueprintCreateContext()
  const { optionalBlueprintFields, overridableContextBlueprintFields, requiredBlueprintFields } =
    useBlueprintManifestFields()
  const [submitMode, setSubmitMode] = useState<'create' | 'create-and-deploy' | null>(null)
  const [isWaitingForServiceCreated, setIsWaitingForServiceCreated] = useState(false)
  const [isBlueprintCreationFailed, setIsBlueprintCreationFailed] = useState(false)
  const [blueprintCreationErrorMessage, setBlueprintCreationErrorMessage] = useState<string>()
  const [createdBlueprintId, setCreatedBlueprintId] = useState<string>()
  const [createdDeploymentId, setCreatedDeploymentId] = useState<string>()
  const [pendingBlueprintCreation, setPendingBlueprintCreation] = useState<PendingBlueprintCreation | null>(null)
  const [lastBlueprintCreation, setLastBlueprintCreation] = useState<PendingBlueprintCreation | null>(null)
  const hasHandledServiceCreatedRef = useRef(false)
  const hasBlueprintCreationErrorRef = useRef(false)
  const hasStartedBlueprintCreationRef = useRef(false)
  const blueprintStatusPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
  // Subscribe *and* fetch-current: the websocket only reports success, and it cannot cover a
  // reload, a dropped connection, or a dispatch that fails before the subscription lands. The
  // blueprint is the authoritative read, so it is polled from the dispatch rather than as a
  // fallback after one.
  const { data: blueprintDetails } = useBlueprint({
    blueprintId: createdBlueprintId ?? '',
    enabled: isWaitingForServiceCreated && !isBlueprintCreationFailed,
    refetchInterval: BLUEPRINT_STATUS_POLL_INTERVAL_MS,
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

  const clearBlueprintStatusPollTimeout = useCallback(() => {
    if (!blueprintStatusPollTimeoutRef.current) {
      return
    }

    clearTimeout(blueprintStatusPollTimeoutRef.current)
    blueprintStatusPollTimeoutRef.current = null
  }, [])

  const handleBlueprintServiceCreated = useCallback(() => {
    if (hasHandledServiceCreatedRef.current || hasBlueprintCreationErrorRef.current) {
      return
    }

    hasHandledServiceCreatedRef.current = true
    clearBlueprintStatusPollTimeout()
    setIsWaitingForServiceCreated(false)
    setSubmitMode(null)
    toast('success', 'Your service has been created')
    navigateToEnvironmentOverview()
  }, [clearBlueprintStatusPollTimeout, navigateToEnvironmentOverview])

  const failBlueprintCreation = useCallback(
    (errorMessage?: string) => {
      if (hasHandledServiceCreatedRef.current) {
        return
      }

      hasBlueprintCreationErrorRef.current = true
      clearBlueprintStatusPollTimeout()
      setPendingBlueprintCreation(null)
      setIsWaitingForServiceCreated(false)
      setIsBlueprintCreationFailed(true)
      setBlueprintCreationErrorMessage(errorMessage)
      setSubmitMode(null)
    },
    [clearBlueprintStatusPollTimeout]
  )

  const startBlueprintStatusDeadline = useCallback(() => {
    if (hasHandledServiceCreatedRef.current) {
      return
    }

    clearBlueprintStatusPollTimeout()
    blueprintStatusPollTimeoutRef.current = setTimeout(() => {
      failBlueprintCreation(BLUEPRINT_STATUS_POLL_TIMEOUT_MESSAGE)
    }, BLUEPRINT_STATUS_POLL_TIMEOUT_MS)
  }, [clearBlueprintStatusPollTimeout, failBlueprintCreation])

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

  useEffect(() => () => clearBlueprintStatusPollTimeout(), [clearBlueprintStatusPollTimeout])

  useEffect(() => {
    if (!hasBlueprintCreationError) {
      return
    }

    // The logs already spell out the failure, so no extra message to surface
    failBlueprintCreation()
  }, [failBlueprintCreation, hasBlueprintCreationError])

  useEffect(() => {
    // Retrying mints a new blueprint, so a result for the previous one must not be read as this
    // one's outcome.
    if (!isWaitingForServiceCreated || !blueprintDetails || blueprintDetails.id !== createdBlueprintId) {
      return
    }

    match(resolveBlueprintCreationOutcome(blueprintDetails, createdDeploymentId))
      .with({ status: 'created' }, () => handleBlueprintServiceCreated())
      .with({ status: 'failed' }, ({ errorMessage }) => failBlueprintCreation(errorMessage))
      // Still WAITING_RUNNING or DEPLOYING: the poll keeps asking rather than guessing an outcome
      .with({ status: 'pending' }, () => undefined)
      .exhaustive()
  }, [
    blueprintDetails,
    createdBlueprintId,
    createdDeploymentId,
    failBlueprintCreation,
    handleBlueprintServiceCreated,
    isWaitingForServiceCreated,
  ])

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
        setCreatedDeploymentId(createdBlueprint.deployment_id)
        posthog.capture('create-service', {
          selectedServiceType: 'blueprint',
          selectedServiceSubType: blueprint.serviceFamily ?? blueprint.provider,
        })
        setPendingBlueprintCreation(null)
        startBlueprintStatusDeadline()
      } catch {
        if (!shouldUpdateState) {
          return
        }

        // errors are surfaced by mutation notifications
        clearBlueprintStatusPollTimeout()
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
    clearBlueprintStatusPollTimeout,
    createBlueprint,
    environmentId,
    isWaitingForServiceCreated,
    pendingBlueprintCreation,
    startBlueprintStatusDeadline,
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
    clearBlueprintStatusPollTimeout()
    hasHandledServiceCreatedRef.current = false
    hasBlueprintCreationErrorRef.current = false
    hasStartedBlueprintCreationRef.current = false
    setCreatedBlueprintId(undefined)
    setCreatedDeploymentId(undefined)
    setIsBlueprintCreationFailed(false)
    setBlueprintCreationErrorMessage(undefined)
    setLastBlueprintCreation(blueprintCreation)
    setIsWaitingForServiceCreated(true)

    setPendingBlueprintCreation(blueprintCreation)
  }

  const handleRetry = () => {
    if (!lastBlueprintCreation) return

    clearBlueprintStatusPollTimeout()
    hasHandledServiceCreatedRef.current = false
    hasBlueprintCreationErrorRef.current = false
    hasStartedBlueprintCreationRef.current = false
    setCreatedBlueprintId(undefined)
    setCreatedDeploymentId(undefined)
    setIsBlueprintCreationFailed(false)
    setBlueprintCreationErrorMessage(undefined)
    setSubmitMode(lastBlueprintCreation.deploy ? 'create-and-deploy' : 'create')
    setIsWaitingForServiceCreated(true)

    setPendingBlueprintCreation(lastBlueprintCreation)
  }

  const handleEditConfig = () => {
    clearBlueprintStatusPollTimeout()
    hasBlueprintCreationErrorRef.current = false
    setIsWaitingForServiceCreated(false)
    setIsBlueprintCreationFailed(false)
    setBlueprintCreationErrorMessage(undefined)
    setSubmitMode(null)
    navigate({ to: `${creationFlowUrl}/service-information` })
  }

  return (
    <>
      <FunnelFlowBody customContentWidth="max-w-[684px]">
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
        errorMessage={blueprintCreationErrorMessage}
        logs={blueprintCreationLogs}
        onEditConfig={handleEditConfig}
        onRetry={handleRetry}
        open={
          (blueprintCreationLogs.length > 0 || Boolean(blueprintCreationErrorMessage)) &&
          (isWaitingForServiceCreated || isBlueprintCreationFailed)
        }
        serviceName={serviceName}
      />
    </>
  )
}

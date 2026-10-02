import { useNavigate } from '@tanstack/react-router'
import download from 'downloadjs'
import equal from 'fast-deep-equal'
import {
  type ClusterRegion,
  type PlatformComponentConfigurationResolutionResponse,
  type PlatformTemplateComponentResponse,
  type SelfManagedClusterPlatformSelection,
} from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import {
  Button,
  Callout,
  CopyButton,
  ExternalLink,
  Icon,
  IconFlag,
  InputSelect,
  InputText,
  InputToggle,
  LoaderSpinner,
} from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { ClusterCredentialsSettings } from '../cluster-credentials-settings/cluster-credentials-settings'
import { ProfileConfigurationField } from '../cluster-profile/profile-configuration-field'
import { useClusterOperatorBootstrap } from '../hooks/use-cluster-operator-bootstrap/use-cluster-operator-bootstrap'
import { useClusterOperatorStatus } from '../hooks/use-cluster-operator-status/use-cluster-operator-status'
import { useCreateSelfManagedCluster } from '../hooks/use-create-self-managed-cluster/use-create-self-managed-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformTemplateComponentConfiguration } from '../platform-configuration/hooks/use-platform-template-component-configuration'
import {
  applyPlatformConfigurationDefaults,
  getUnmappedViolations,
  isPlatformConfigurationReady,
  isSupportedPlatformField,
  omitEmptyValues,
} from '../platform-configuration/platform-configuration-utils'

const OPERATOR_STATUS_POLL_INTERVAL = 5000
const INSTALLATION_DOCUMENTATION_URL = 'https://www.qovery.com/docs/getting-started/installation/kubernetes'
const SUPPORT_URL = 'https://www.qovery.com/contact'

export type SelfManagedClusterCreationStep = 'general' | 'operator' | 'install'

export const SELF_MANAGED_CLUSTER_CREATION_MODAL_WIDTH: Record<SelfManagedClusterCreationStep, number> = {
  general: 676,
  operator: 676,
  install: 474,
}

interface GeneralValues {
  name: string
  production: boolean
  credentials: string
  region: string
}

type OperatorValues = Record<string, unknown>

// The bootstrap Helm command reads its values from this file name.
export const OPERATOR_VALUES_FILE_NAME = 'values.yaml'

// Only the local demo builder needs the Operator CPU architecture.
const DEMO_ONLY_OPERATOR_FIELD_KEYS = ['cpuArchitectures']

export function getOperatorFields(
  component: PlatformTemplateComponentResponse | null | undefined,
  preview?: PlatformComponentConfigurationResolutionResponse
) {
  // The resolved fields carry per-item fields for arrays: prefer them once available.
  return (preview?.fields ?? component?.fields ?? []).filter(
    (field) => isSupportedPlatformField(field) && !DEMO_ONLY_OPERATOR_FIELD_KEYS.includes(field.key)
  )
}

function StepLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6 pt-5">
      <div className="flex flex-col gap-1 px-5">
        <h2 className="h4 text-neutral">{title}</h2>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </div>
      {children}
      {footer ? (
        <div className="flex items-center justify-between gap-2 border-t border-neutral bg-surface-neutral px-5 py-4">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

function StepSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 px-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-neutral">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function GeneralStep({
  values,
  onCancel,
  onContinue,
}: {
  values?: GeneralValues
  onCancel: () => void
  onContinue: (values: GeneralValues) => void
}) {
  const methods = useForm<GeneralValues>({
    mode: 'onChange',
    defaultValues: values ?? { name: '', production: true, credentials: '', region: '' },
  })
  const { data: cloudProviders = [] } = useCloudProviders()
  const regionOptions = useMemo(
    () =>
      cloudProviders
        .find(({ short_name }) => short_name === 'AWS')
        ?.regions?.map((region: ClusterRegion) => {
          const label = `${region.city} (${region.name})`
          return { label, value: region.name, icon: <IconFlag code={region.country_code} /> }
        }) ?? [],
    [cloudProviders]
  )

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onContinue)}>
        <StepLayout
          title="Connect AWS cluster"
          description="Fill in your cluster base information to connect it with Qovery"
          footer={
            <>
              <span />
              <div className="flex gap-2">
                <Button type="button" variant="plain" color="neutral" size="lg" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={!methods.formState.isValid}>
                  Continue
                </Button>
              </div>
            </>
          }
        >
          <StepSection title="General information">
            <Controller
              name="name"
              control={methods.control}
              rules={{ validate: (value) => Boolean(value.trim()) || 'Please enter a cluster name.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  label="Cluster name"
                  value={field.value}
                  onChange={field.onChange}
                  error={error?.message}
                  autoFocus
                />
              )}
            />
            <Controller
              name="production"
              control={methods.control}
              render={({ field }) => (
                <InputToggle small title="Production cluster" value={field.value} onChange={field.onChange} />
              )}
            />
          </StepSection>
          <StepSection title="Deployment target">
            <ClusterCredentialsSettings cloudProvider="AWS" isSetting={false} />
            <Controller
              name="region"
              control={methods.control}
              rules={{ required: 'Please select a region.' }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Region"
                  options={regionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={error?.message}
                  isSearchable
                  portal
                />
              )}
            />
          </StepSection>
        </StepLayout>
      </form>
    </FormProvider>
  )
}

function OperatorStep({
  component,
  preview,
  values,
  isCreating,
  canContinue,
  isTemplatesError,
  isPreviewError,
  onRetryTemplates,
  onRetryPreview,
  onChange,
  onBack,
  onCancel,
  onContinue,
}: {
  component?: PlatformTemplateComponentResponse | null
  preview?: PlatformComponentConfigurationResolutionResponse
  values: OperatorValues
  isCreating: boolean
  canContinue: boolean
  isTemplatesError: boolean
  isPreviewError: boolean
  onRetryTemplates: () => void
  onRetryPreview: () => void
  onChange: (values: OperatorValues) => void
  onBack: () => void
  onCancel: () => void
  onContinue: () => void
}) {
  const fields = getOperatorFields(component, preview)
  const violations = preview?.violations ?? []
  const unmappedViolations = getUnmappedViolations(violations, fields, values, preview?.requirements ?? [])
  const loadingError = isTemplatesError
    ? { message: 'The Operator configuration could not be loaded.', onRetry: onRetryTemplates }
    : isPreviewError
      ? { message: 'The Operator configuration could not be checked.', onRetry: onRetryPreview }
      : undefined

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onContinue()
      }}
    >
      <StepLayout
        title="Configure Qovery Operator"
        description={
          <>
            The Operator runs on your cluster and installs the Qovery stack. Leave as is unless you want it pinned to a
            specific node group. Consult our{' '}
            <ExternalLink href={INSTALLATION_DOCUMENTATION_URL} size="sm" withIcon={false} className="underline">
              documentation
            </ExternalLink>{' '}
            for more details.
          </>
        }
        footer={
          <>
            <Button type="button" variant="outline" color="neutral" size="lg" disabled={isCreating} onClick={onBack}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="plain" color="neutral" size="lg" disabled={isCreating} onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" size="lg" loading={isCreating} disabled={!canContinue}>
                Continue
              </Button>
            </div>
          </>
        }
      >
        {loadingError ? (
          <Callout.Root color="red" className="mx-5">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextDescription>{loadingError.message}</Callout.TextDescription>
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="sm"
                className="mt-2"
                onClick={loadingError.onRetry}
              >
                Try again
              </Button>
            </Callout.Text>
          </Callout.Root>
        ) : null}
        {unmappedViolations.length ? (
          <ul role="alert" className="mx-5 flex flex-col gap-1 text-sm text-negative">
            {unmappedViolations.map((violation) => (
              <li key={`${violation.fieldPath}-${violation.code}`}>{violation.message}</li>
            ))}
          </ul>
        ) : null}
        {fields.length ? (
          <StepSection title="Configuration">
            <div className="overflow-hidden rounded-md border border-neutral [&>*:last-child]:border-b-0">
              {fields.map((field) => (
                <ProfileConfigurationField
                  key={field.key}
                  field={field}
                  path={field.key}
                  value={values[field.key]}
                  violations={violations}
                  onChange={(value) => {
                    const { [field.key]: _, ...otherValues } = values
                    onChange(value === undefined ? otherValues : { ...otherValues, [field.key]: value })
                  }}
                />
              ))}
            </div>
          </StepSection>
        ) : (
          <p className="px-5 text-sm text-neutral-subtle">
            Qovery installs the Operator with its default configuration.
          </p>
        )}
      </StepLayout>
    </form>
  )
}

function InstallStep({
  organizationId,
  clusterId,
  onInstalled,
}: {
  organizationId: string
  clusterId: string
  onInstalled: () => void
}) {
  const {
    data: bootstrap,
    isLoading: isBootstrapLoading,
    isError: isBootstrapError,
    refetch: refetchBootstrap,
  } = useClusterOperatorBootstrap({ organizationId, clusterId })
  const { data: operatorStatus } = useClusterOperatorStatus({
    organizationId,
    clusterId,
    refetchInterval: OPERATOR_STATUS_POLL_INTERVAL,
  })

  useEffect(() => {
    if (operatorStatus?.operator_connected) onInstalled()
  }, [onInstalled, operatorStatus?.operator_connected])

  return (
    <div className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="h4 text-neutral">Install Qovery operator</h2>
      </div>
      {isBootstrapLoading ? (
        <div className="flex justify-center py-6">
          <LoaderSpinner />
        </div>
      ) : isBootstrapError || !bootstrap ? (
        <Callout.Root color="red">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextDescription>The installation instructions could not be generated.</Callout.TextDescription>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="sm"
              className="mt-2"
              onClick={() => refetchBootstrap()}
            >
              Try again
            </Button>
          </Callout.Text>
        </Callout.Root>
      ) : (
        <ol className="flex flex-col gap-4 text-sm text-neutral">
          <li className="flex flex-col gap-2">
            <p>
              <span className="font-medium">1. Download the Helm values file.</span>{' '}
              <span className="text-neutral-subtle">
                It contains the cluster credential: keep it private and delete it once installed.
              </span>
            </p>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="md"
              className="self-start"
              onClick={() => download(bootstrap.values_yaml, OPERATOR_VALUES_FILE_NAME, 'text/yaml')}
            >
              <Icon iconName="download" iconStyle="regular" />
              Download {OPERATOR_VALUES_FILE_NAME}
            </Button>
          </li>
          <li className="flex flex-col gap-2">
            <p>
              <span className="font-medium">2. Run this command</span>{' '}
              <span className="text-neutral-subtle">
                from the folder of the values file, with a kubeconfig pointing to your cluster.
              </span>
            </p>
            <div className="flex items-center gap-3 rounded-md border border-neutral bg-surface-neutral-subtle p-3">
              <code className="min-w-0 flex-1 break-all text-sm text-neutral">{bootstrap.helm_command}</code>
              <CopyButton content={bootstrap.helm_command} />
            </div>
          </li>
        </ol>
      )}
      <Callout.Root color="sky">
        <Callout.Icon>
          <Icon iconName="circle-info" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          Do not close this tab. The Operator will connect to Qovery shortly once its installation completes. You'll be
          redirected to the cluster profile settings once the operator is installed.
        </Callout.Text>
      </Callout.Root>
      <p className="text-ssm text-neutral-subtle">
        Having trouble installing? Check our{' '}
        <ExternalLink href={INSTALLATION_DOCUMENTATION_URL} size="ssm" withIcon={false} className="underline">
          documentation
        </ExternalLink>{' '}
        or{' '}
        <ExternalLink href={SUPPORT_URL} size="ssm" withIcon={false} className="underline">
          contact support
        </ExternalLink>
      </p>
    </div>
  )
}

export interface SelfManagedClusterCreationFlowProps {
  organizationId: string
  onStepChange?: (step: SelfManagedClusterCreationStep) => void
  onClose: () => void
}

export function SelfManagedClusterCreationFlow({
  organizationId,
  onStepChange,
  onClose,
}: SelfManagedClusterCreationFlowProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<SelfManagedClusterCreationStep>('general')
  const [generalValues, setGeneralValues] = useState<GeneralValues>()
  // Unset until edited, so the defaults of the template loaded meanwhile still apply.
  const [operatorValues, setOperatorValues] = useState<OperatorValues>()
  const [clusterId, setClusterId] = useState<string>()
  const {
    data: templates,
    isSuccess: isTemplatesSuccess,
    isError: isTemplatesError,
    refetch: refetchTemplates,
  } = usePlatformTemplates({
    organizationId,
    clusterMode: 'CUSTOMER_MANAGED',
    cloudProvider: 'AWS',
  })
  const template = templates?.[0]
  const operatorComponent = template?.bootstrapComponent
  const resolvedOperatorValues = useMemo(
    () => operatorValues ?? applyPlatformConfigurationDefaults(getOperatorFields(operatorComponent), {}),
    [operatorComponent, operatorValues]
  )
  const operatorConfig = useMemo(() => omitEmptyValues(resolvedOperatorValues), [resolvedOperatorValues])
  const { mutateAsync: createSelfManagedCluster, isLoading: isCreating } = useCreateSelfManagedCluster()
  const debouncedOperatorConfig = useDebounce(operatorConfig, 300)
  const {
    data: operatorPreview,
    isFetching: isOperatorPreviewFetching,
    isPaused: isOperatorPreviewPaused,
    isPreviousData: isOperatorPreviewOutdated,
    isError: isOperatorPreviewError,
    refetch: refetchOperatorPreview,
  } = usePlatformTemplateComponentConfiguration({
    organizationId,
    templateKey: template?.key,
    templateVersion: template?.version,
    componentKey: operatorComponent?.key,
    clusterMode: 'CUSTOMER_MANAGED',
    cloudProvider: 'AWS',
    request: { profileConfig: debouncedOperatorConfig, clusterInputs: {}, componentOutputs: {} },
    enabled: step === 'operator',
  })
  const isOperatorConfigurationValid =
    !operatorComponent ||
    (equal(debouncedOperatorConfig, operatorConfig) &&
      !isOperatorPreviewFetching &&
      !isOperatorPreviewPaused &&
      !isOperatorPreviewOutdated &&
      !isOperatorPreviewError &&
      operatorPreview?.componentKey === operatorComponent.key &&
      isPlatformConfigurationReady(operatorPreview.violations, operatorPreview.requirements))

  const goToStep = (nextStep: SelfManagedClusterCreationStep) => {
    setStep(nextStep)
    onStepChange?.(nextStep)
  }

  // q-core selects the self-managed platform template release: only the edited Operator values are sent.
  const getPlatformSelection = (): SelfManagedClusterPlatformSelection =>
    operatorComponent && operatorValues !== undefined && Object.keys(operatorConfig).length
      ? { managedConfig: { [operatorComponent.key]: operatorConfig } }
      : {}

  const createCluster = async () => {
    if (!generalValues) return

    try {
      const cluster = await createSelfManagedCluster({
        organizationId,
        clusterRequest: {
          name: generalValues.name.trim(),
          production: generalValues.production,
          provider: 'AWS',
          region: generalValues.region,
          credentials: { id: generalValues.credentials },
          platform: getPlatformSelection(),
        },
      })
      setClusterId(cluster.id)
      goToStep('install')
    } catch {
      // Errors are notified by the mutation.
    }
  }

  if (step === 'install' && clusterId) {
    return (
      <InstallStep
        organizationId={organizationId}
        clusterId={clusterId}
        onInstalled={() => {
          onClose()
          navigate({
            to: '/organization/$organizationId/cluster/$clusterId/profile',
            params: { organizationId, clusterId },
          })
        }}
      />
    )
  }

  if (step === 'operator') {
    return (
      <OperatorStep
        component={operatorComponent}
        preview={operatorPreview}
        values={resolvedOperatorValues}
        isCreating={isCreating}
        // An empty template list lets q-core pick the default; a failed request must not create the cluster blindly.
        canContinue={isTemplatesSuccess && isOperatorConfigurationValid}
        isTemplatesError={isTemplatesError}
        isPreviewError={isOperatorPreviewError}
        onRetryTemplates={() => refetchTemplates()}
        onRetryPreview={() => refetchOperatorPreview()}
        onChange={setOperatorValues}
        onBack={() => goToStep('general')}
        onCancel={onClose}
        onContinue={createCluster}
      />
    )
  }

  return (
    <GeneralStep
      values={generalValues}
      onCancel={onClose}
      onContinue={(values) => {
        setGeneralValues(values)
        goToStep('operator')
      }}
    />
  )
}

export default SelfManagedClusterCreationFlow

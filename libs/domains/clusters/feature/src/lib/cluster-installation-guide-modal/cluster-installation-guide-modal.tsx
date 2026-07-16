import download from 'downloadjs'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Cluster } from 'qovery-typescript-axios'
import { Button, Callout, CopyButton, ExternalLink, Icon, LoaderSpinner } from '@qovery/shared/ui'
import { ClusterSetup } from '../cluster-setup/cluster-setup'
import { useInstallationHelmValues } from '../hooks/use-installation-helm-values/use-installation-helm-values'
import {
  useClusterOperatorBootstrap,
  useClusterOperatorStatus,
} from '../platform-configuration/hooks/use-cluster-operator'
import { PLATFORM_CONFIGURATION_FEATURE_FLAG } from '../platform-configuration/platform-configuration-feature-flag'

export type ClusterInstallationGuideModalProps = {
  type: 'MANAGED' | 'ON_PREMISE'
  onClose: () => void
} & (
  | {
      mode: 'EDIT'
      cluster: Cluster
    }
  | {
      mode: 'CREATE'
      isDemo: boolean
    }
)

export function ClusterInstallationGuideModal({ type, onClose, ...props }: ClusterInstallationGuideModalProps) {
  const isEngineV2Enabled = useFeatureFlagEnabled(PLATFORM_CONFIGURATION_FEATURE_FLAG)
  const cluster = props.mode === 'EDIT' ? props.cluster : undefined
  // Boolean() matters: the flag is undefined while PostHog loads, and passing
  // `enabled: undefined` to the operator hooks would fall back to their `enabled = true` default.
  const canUseOperator = Boolean(isEngineV2Enabled) && cluster?.kubernetes === 'SELF_MANAGED'
  const isFeatureFlagLoading = isEngineV2Enabled === undefined && cluster?.kubernetes === 'SELF_MANAGED'
  const {
    data: operatorStatus,
    isLoading: isOperatorStatusLoading,
    isError: isOperatorStatusError,
    refetch: refetchOperatorStatus,
  } = useClusterOperatorStatus({
    organizationId: cluster?.organization.id ?? '',
    clusterId: cluster?.id ?? '',
    enabled: canUseOperator,
  })
  const {
    data: operatorBootstrap,
    isLoading: isOperatorBootstrapLoading,
    isError: isOperatorBootstrapError,
    refetch: refetchOperatorBootstrap,
  } = useClusterOperatorBootstrap({
    organizationId: cluster?.organization.id ?? '',
    clusterId: cluster?.id ?? '',
    enabled: canUseOperator && Boolean(operatorStatus),
  })
  const { mutateAsync: getInstallationHelmValues, isLoading } = useInstallationHelmValues()
  const downloadInstallationValues = async () => {
    if (props.mode === 'CREATE') {
      return
    }
    const installationHelmValues = await getInstallationHelmValues({
      organizationId: props.cluster.organization.id,
      clusterId: props.cluster.id,
    })
    download(installationHelmValues ?? '', `cluster-installation-guide-${props.cluster.id}.yaml`, 'text/plain')
  }

  const isDemo = props.mode === 'CREATE' ? props.isDemo : props.cluster.is_demo
  const isOperatorManaged = canUseOperator && Boolean(operatorStatus)
  const isOperatorGuideLoading =
    isFeatureFlagLoading ||
    (canUseOperator && (isOperatorStatusLoading || (isOperatorManaged && isOperatorBootstrapLoading)))
  // Only a bootstrap failure of a confirmed operator-managed cluster blocks the guide;
  // a status failure falls back to the legacy instructions, which don't depend on the operator.
  const hasOperatorGuideError = isOperatorManaged && isOperatorBootstrapError

  const retryOperatorGuide = () => {
    if (isOperatorStatusError) void refetchOperatorStatus()
    if (isOperatorBootstrapError) void refetchOperatorBootstrap()
  }

  const downloadOperatorValues = () => {
    if (!cluster || !operatorBootstrap) return
    download(operatorBootstrap.valuesYaml, 'values.yaml', 'text/yaml')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="h4 text-neutral">
        {isDemo ? 'Install Qovery on your local machine' : 'Install Qovery on your cluster'}
      </h2>

      <div className="flex flex-col gap-4">
        {props.mode === 'EDIT' && type === 'ON_PREMISE' && !isOperatorManaged && !hasOperatorGuideError && (
          <Callout.Root color="sky">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              This cluster has been created via Qovery CLI.
              <br />
              Please use the Qovery CLI to manage any upgrade or modification for this cluster.
            </Callout.Text>
          </Callout.Root>
        )}

        {isOperatorGuideLoading ? (
          <div className="flex justify-center py-8">
            <LoaderSpinner className="w-4" />
          </div>
        ) : hasOperatorGuideError ? (
          <Callout.Root color="red">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Unable to load the operator installation guide.</Callout.TextHeading>
              <Callout.TextDescription>
                Retry the request. If the problem persists, contact Qovery support.
              </Callout.TextDescription>
              <Button size="xs" className="mt-3" onClick={retryOperatorGuide}>
                Retry
              </Button>
            </Callout.Text>
          </Callout.Root>
        ) : isOperatorManaged && operatorBootstrap ? (
          <>
            <Callout.Root color="sky" className="items-start">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                Install the Qovery operator on your existing Kubernetes cluster. It will apply the platform layers you
                selected and handle future Engine v2 deployments.
              </Callout.Text>
            </Callout.Root>
            <ol className="flex list-none flex-col gap-4 text-sm font-medium text-neutral">
              <li className="rounded border border-neutral p-3">
                <h3 className="mb-1 text-sm font-medium">1. Download the operator values</h3>
                <p className="mb-2 font-normal text-neutral-subtle">
                  Save the generated values file. It contains the credentials assigned to this cluster.
                </p>
                <Button size="xs" onClick={downloadOperatorValues}>
                  Download values
                  <Icon iconName="download" />
                </Button>
              </li>
              <li className="rounded border border-neutral p-3">
                <h3 className="mb-1 text-sm font-medium">2. Install the operator</h3>
                <p className="mb-2 font-normal text-neutral-subtle">
                  Run this command from the directory containing the downloaded values file.
                </p>
                <pre className="flex items-start justify-between gap-2 whitespace-pre-wrap break-all rounded-sm bg-surface-neutral-subtle p-3 font-mono text-neutral">
                  <span>
                    <span className="select-none">$ </span>
                    {operatorBootstrap.helmCommand}
                  </span>
                  <CopyButton content={operatorBootstrap.helmCommand} />
                </pre>
              </li>
              <li className="rounded border border-neutral p-3">
                <h3 className="mb-1 text-sm font-medium">3. Deploy your first environment</h3>
                <p className="font-normal text-neutral-subtle">
                  Once the operator is connected, return to the Qovery console and deploy an environment on this
                  cluster.
                </p>
              </li>
            </ol>
          </>
        ) : type === 'MANAGED' ? (
          <ol className="ml-4 list-outside list-decimal text-neutral" type="1">
            <li className="mb-6 text-sm font-medium">
              <span>Save the following yaml, it contains the Qovery configuration assigned to your cluster.</span>
              <br />
              <span className="mt-2 inline-block">
                <Button
                  size="xs"
                  variant="solid"
                  color="brand"
                  onClick={downloadInstallationValues}
                  loading={isLoading}
                >
                  Download configuration
                  <Icon iconName="download" />
                </Button>
              </span>
            </li>
            <li className="text-sm font-medium">
              <span>Make sure you meet the requirements described here</span>
              <br />
              <ExternalLink className="mt-2" href="https://www.qovery.com/docs/getting-started/installation/kubernetes">
                Documentation
              </ExternalLink>
            </li>
          </ol>
        ) : null}

        {type === 'ON_PREMISE' && !isOperatorGuideLoading && !isOperatorManaged && !hasOperatorGuideError && (
          <ClusterSetup
            type={(props.mode === 'CREATE' ? props.isDemo : props.cluster.is_demo) ? 'LOCAL_DEMO' : 'SELF_MANAGED'}
          />
        )}
      </div>

      {type === 'MANAGED' && !isOperatorManaged && !hasOperatorGuideError && (
        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            Note: You can access again this installation guide and the configuration file by opening the “Installation
            guide” section from the cluster menu
          </Callout.Text>
        </Callout.Root>
      )}

      <div className="flex justify-end">
        <Button size="lg" variant="plain" color="neutral" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

export default ClusterInstallationGuideModal

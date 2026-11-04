import download from 'downloadjs'
import { Button, Callout, CopyButton, ExternalLink, Heading, Icon, LoaderSpinner, Section } from '@qovery/shared/ui'
import { isHttpStatus } from '@qovery/shared/utils'
import { useClusterOperatorBootstrap } from '../hooks/use-cluster-operator-bootstrap/use-cluster-operator-bootstrap'

export const INSTALLATION_DOCUMENTATION_URL = 'https://www.qovery.com/docs/getting-started/installation/kubernetes'
const SUPPORT_URL = 'https://www.qovery.com/contact'

// The bootstrap Helm command reads its values from this file name.
const OPERATOR_VALUES_FILE_NAME = 'values.yaml'

export interface ClusterOperatorInstallInstructionsProps {
  organizationId: string
  clusterId: string
}

export function ClusterOperatorInstallInstructions({
  organizationId,
  clusterId,
}: ClusterOperatorInstallInstructionsProps) {
  const {
    data: bootstrap,
    isLoading: isBootstrapLoading,
    isError: isBootstrapError,
    error: bootstrapError,
    refetch: refetchBootstrap,
  } = useClusterOperatorBootstrap({ organizationId, clusterId })

  return (
    <Section className="gap-4 p-5">
      <Heading className="text-2xl">Install Qovery Operator</Heading>
      {isBootstrapLoading ? (
        <div
          role="status"
          aria-busy="true"
          aria-label="Loading installation instructions"
          className="flex justify-center py-6"
        >
          <LoaderSpinner />
        </div>
      ) : isHttpStatus(bootstrapError, 403) ? (
        <Callout.Root color="neutral">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>Only cluster administrators can get the installation instructions.</Callout.Text>
        </Callout.Root>
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
        <Callout.Text>Your cluster will be available as soon as the Operator is connected.</Callout.Text>
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
    </Section>
  )
}

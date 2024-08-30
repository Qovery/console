import download from 'downloadjs'
import { type Cluster } from 'qovery-typescript-axios'
import { Button, Callout, ExternalLink, Icon } from '@qovery/shared/ui'
import { ClusterSetup } from '../cluster-setup/cluster-setup'
import { useInstallationHelmValues } from '../hooks/use-installation-helm-values/use-installation-helm-values'

export interface ClusterInstallationGuideModalProps {
  cluster: Cluster
  type: 'MANAGED' | 'ON_PREMISE'
  onClose: () => void
}

export function ClusterInstallationGuideModal({ cluster, type, onClose }: ClusterInstallationGuideModalProps) {
  const { mutateAsync: getInstallationHelmValues, isLoading } = useInstallationHelmValues()
  const downloadInstallationValues = async () => {
    const installationHelmValues = await getInstallationHelmValues({
      organizationId: cluster.organization.id,
      clusterId: cluster.id,
    })
    download(installationHelmValues ?? '', `cluster-installation-guide-${cluster.id}.yaml`, 'text/plain')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="h4 text-neutral-400">Installation guide</h2>

      <div className="flex flex-col gap-4">
        {type === 'ON_PREMISE' && (
          <Callout.Root color="sky">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text className="text-xs">
              This cluster has been created via Qovery CLI.
              <br />
              Please use the Qovery CLI to manage any upgrade or modification for this cluster.
            </Callout.Text>
          </Callout.Root>
        )}

        {type === 'MANAGED' && (
          <ol className="ml-4 list-outside list-decimal text-neutral-400" type="1">
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
                  className="gap-1"
                >
                  Download configuration
                  <Icon iconName="download" />
                </Button>
              </span>
            </li>
            <li className="text-sm font-medium">
              <span>Make sure you meet the requirements described here</span>
              <br />
              <ExternalLink
                className="mt-2"
                href="https://hub.qovery.com/docs/getting-started/install-qovery/kubernetes/quickstart/"
              >
                Documentation
              </ExternalLink>
            </li>
          </ol>
        )}

        {type === 'ON_PREMISE' && <ClusterSetup type={cluster.is_demo ? 'LOCAL_DEMO' : 'SELF_MANAGED'} />}
      </div>

      {type === 'MANAGED' && (
        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text className="text-xs">
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

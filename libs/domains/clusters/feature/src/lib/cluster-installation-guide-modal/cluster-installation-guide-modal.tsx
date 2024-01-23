import download from 'downloadjs'
import { Button, Callout, ExternalLink, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { useInstallationHelmValues } from '../hooks/use-installation-helm-values/use-installation-helm-values'

export interface ClusterInstallationGuideModalProps {
  clusterId: string
  organizationId: string
  onClose: () => void
}

export function ClusterInstallationGuideModal({
  clusterId,
  organizationId,
  onClose,
}: ClusterInstallationGuideModalProps) {
  const { mutateAsync: getInstallationHelmValues, isLoading } = useInstallationHelmValues()
  const downloadInstallationValues = async () => {
    const installationHelmValues = await getInstallationHelmValues({ organizationId, clusterId })
    download(installationHelmValues ?? '', `cluster-installation-guide-${clusterId}.yaml`, 'text/plain')
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="h4 text-neutral-400">Installation guide</h2>

      <ol className="ml-4 list-outside list-decimal text-neutral-400" type="1">
        <li className="mb-6 text-sm font-medium">
          <span>Save the following yaml, it contains the Qovery configuration assigned to your cluster.</span>
          <br />
          <span className="inline-block mt-2">
            <Button
              size="xs"
              variant="solid"
              color="brand"
              onClick={downloadInstallationValues}
              loading={isLoading}
              className="gap-1"
            >
              Download configuration
              <Icon name={IconAwesomeEnum.DOWNLOAD} />
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

      <Callout.Root color="sky">
        <Callout.Icon>
          <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
        </Callout.Icon>
        <Callout.Text className="text-xs">
          Note: You can access again this installation guide and the configuration file by opening the “Installation
          guide” section from the cluster menu
        </Callout.Text>
      </Callout.Root>

      <div className="flex justify-end">
        <Button size="lg" variant="outline" color="neutral" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

export default ClusterInstallationGuideModal

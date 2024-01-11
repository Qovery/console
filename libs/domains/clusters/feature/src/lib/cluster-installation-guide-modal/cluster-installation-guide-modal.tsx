import { Button, Callout, ExternalLink, Icon, IconAwesomeEnum, Skeleton } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
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
  const [, copyToClipboard] = useCopyToClipboard()
  const { data: installationHelmValues, isLoading } = useInstallationHelmValues({ organizationId, clusterId })
  const copyInstallationValues = () => {
    installationHelmValues && copyToClipboard(installationHelmValues)
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="h4 text-neutral-400 max-w-sm truncate">Installation guide</h2>

      <ol className="ml-4 list-outside list-decimal" type="1">
        <li className="mb-4">
          <span>Save the following yaml, it contains the Qovery configuration assigned to your cluster.</span>
          <br />
          <span className="inline-block mt-2">
            <Skeleton height={40} width={110} show={isLoading}>
              <Button size="lg" variant="outline" color="neutral" onClick={copyInstallationValues}>
                Click here to copy
              </Button>
            </Skeleton>
          </span>
        </li>
        <li>
          <span>Follow the instruction described in this documentation</span>
          <br />
          <ExternalLink className="mt-2" href="">
            Documentation
          </ExternalLink>
        </li>
      </ol>

      <Callout.Root color="sky">
        <Callout.Icon>
          <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
        </Callout.Icon>
        <Callout.Text>
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

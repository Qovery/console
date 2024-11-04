import { Callout, ExternalLink, Icon } from '@qovery/shared/ui'
import CopyButton from './copy-button/copy-button'

export function ClusterSetup({ type }: { type: 'LOCAL_DEMO' | 'SELF_MANAGED' }) {
  return (
    <>
      {type === 'SELF_MANAGED' && (
        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="info-circle" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <p>
              This guide walks you through the process of installing Qovery on your existing Kubernetes cluster, where
              you will have full control over the infrastructure. You will be responsible for managing updates and
              upgrades. Please note that advanced Kubernetes knowledge is required.
            </p>
          </Callout.Text>
        </Callout.Root>
      )}
      <ul className="flex flex-col gap-4 text-sm font-medium text-neutral-400">
        <li className="rounded border border-neutral-200 p-3">
          <h5 className="mb-1 text-sm font-medium">1. Download/Update Qovery CLI</h5>
          <p className="mb-2 font-normal text-neutral-350">
            Download and install the Qovery CLI (or update its version to the latest version).
          </p>
          <ExternalLink href="https://hub.qovery.com/docs/using-qovery/interface/cli/#install">
            https://hub.qovery.com/docs/using-qovery/interface/cli/#install
          </ExternalLink>
        </li>
        <li className="rounded border border-neutral-200 p-3">
          <h5 className="mb-1 text-sm font-medium">
            2. {type === 'LOCAL_DEMO' ? 'Install your cluster' : 'Install Qovery on your cluster'}
          </h5>
          <p className="mb-2  font-normal text-neutral-350">
            Run the following command from your terminal and follow the instructions.
          </p>
          <pre className="flex items-center justify-between rounded-sm bg-neutral-150 p-3 font-mono text-neutral-400">
            {type === 'LOCAL_DEMO' ? (
              <>
                <span>
                  <span className="select-none">$ </span>qovery demo up
                </span>
                <CopyButton content="qovery demo up" />
              </>
            ) : (
              <>
                <span>
                  <span className="select-none">$ </span>qovery cluster install
                </span>
                <CopyButton content="qovery cluster install" />
              </>
            )}
          </pre>
        </li>
        <li className="rounded border border-neutral-200 p-3">
          <h5 className="mb-1 text-sm font-medium">3. Deploy your first environment!</h5>
          <p className="font-normal text-neutral-350">
            Once the installation is completed, get back to the Qovery console and deploy your first environment on your
            brand new cluster.
          </p>
        </li>
      </ul>
    </>
  )
}

export default ClusterSetup

import { ExternalLink } from '@qovery/shared/ui'
import CopyButton from './copy-button/copy-button'

export function ClusterSetup({ type }: { type: 'LOCAL_DEMO' | 'SELF_MANAGED' }) {
  return (
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
        <h5 className="mb-1 text-sm font-medium">2. Install your cluster</h5>
        <p className="mb-2  font-normal text-neutral-350">
          Run the following command from your terminal and follow the instructions.
        </p>
        <pre className="flex items-center justify-between rounded-sm bg-neutral-150 p-3 font-mono text-neutral-400">
          {type === 'LOCAL_DEMO' ? (
            <>
              $ qovery demo up <CopyButton content="qovery demo up" />
            </>
          ) : (
            <>
              $ qovery cluster install <CopyButton content="qovery cluster install" />
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
  )
}

export default ClusterSetup

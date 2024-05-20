import { ExternalLink } from '@qovery/shared/ui'
import CopyButton from './copy-button/copy-button'

export function ClusterSetup({ type }: { type: 'LOCAL_DEMO' | 'SELF_MANAGED' }) {
  return (
    <ul className="flex flex-col gap-4 text-neutral-400 text-sm font-medium">
      <li className="border border-neutral-200 p-3 rounded">
        <h5 className="text-sm font-medium mb-1">1. Download/Update Qovery CLI</h5>
        <p className="font-normal text-neutral-350 mb-2">
          Download and install the Qovery CLI (or update its version to the latest version).
        </p>
        <ExternalLink href="https://hub.qovery.com/docs/using-qovery/interface/cli/#install">
          https://hub.qovery.com/docs/using-qovery/interface/cli/#install
        </ExternalLink>
      </li>
      <li className="border border-neutral-200 p-3 rounded">
        <h5 className="text-sm font-medium mb-1">2. Install your cluster</h5>
        <p className="font-normal  text-neutral-350 mb-2">
          Run the following command from your terminal and follow the instructions.
        </p>
        <pre className="flex items-center justify-between bg-neutral-150 text-neutral-400 p-3 rounded-sm font-mono">
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
      <li className="border border-neutral-200 p-3 rounded">
        <h5 className="text-sm font-medium mb-1">3. Deploy your first environment!</h5>
        <p className="font-normal text-neutral-350">
          Once the installation is completed, get back to the Qovery console and deploy your first environment on your
          brand new cluster.
        </p>
      </li>
    </ul>
  )
}

export default ClusterSetup

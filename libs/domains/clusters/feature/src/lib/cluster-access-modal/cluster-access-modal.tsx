import { ExternalLink, Heading, Section } from '@qovery/shared/ui'
import { CopyButton } from '../cluster-setup/copy-button/copy-button'

export interface ClusterAccessModalProps {
  clusterId: string
}

export function ClusterAccessModal({ clusterId }: ClusterAccessModalProps) {
  const cmdGetKubeconfig = `qovery cluster kubeconfig --cluster-id ${clusterId}`
  const cmdExportKubeConfig = `export KUBECONFIG=<path>`

  return (
    <Section className="p-5">
      <Heading className="h4 max-w-sm truncate text-neutral-400">Access to your cluster</Heading>
      <p className="mb-6 mt-2 text-sm text-neutral-350">
        This section explains how to connect to your cluster using kubectl, k9s.
      </p>
      <ul className="flex flex-col gap-4">
        <li className="flex flex-col gap-2 rounded border border-neutral-250 px-4 py-3 text-sm">
          <span className="font-medium">1. Download/Update Qovery CLI</span>
          <p className="text-neutral-350">
            Download and install the Qovery CLI (or update its version to the latest version)
          </p>
          <ExternalLink href="https://hub.qovery.com/docs/using-qovery/interface/cli/#install">
            https://hub.qovery.com/docs/using-qovery/interface/cli/#install
          </ExternalLink>
        </li>
        <li className="flex flex-col gap-2 rounded border border-neutral-250 px-4 py-3 text-sm">
          <span className="font-medium">2. Get your kubeconfig</span>
          <div className="flex gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
            <div>
              <span className="select-none">$ </span>
              {cmdGetKubeconfig}
            </div>
            <CopyButton content={cmdGetKubeconfig} />
          </div>
        </li>
        <li className="flex flex-col gap-2 rounded border border-neutral-250 px-4 py-3 text-sm">
          <span className="font-medium">3. Export your kubeconfig</span>
          <p className="text-neutral-350">
            Replace the path from the previous command's output and run the following command in your terminal.
          </p>
          <div className="relative flex justify-between gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
            <div>
              <span className="select-none">$ </span>
              {cmdExportKubeConfig}
            </div>
            <CopyButton content={cmdExportKubeConfig} />
          </div>
        </li>
        <li className="flex flex-col gap-2 rounded border border-neutral-250 px-4 py-3 text-sm">
          <span className="font-medium">4. Use your favorite tool to access your cluster. Examples:</span>
          <div className="relative flex justify-between gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
            <div>
              <span className="select-none">$ </span>
              kubectl
            </div>
            <CopyButton content="kubectl" />
          </div>
          <div className="flex justify-between gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
            <div>
              <span className="select-none">$ </span>
              k9s
            </div>
            <CopyButton content="k9s" />
          </div>
        </li>
      </ul>
    </Section>
  )
}

export default ClusterAccessModal

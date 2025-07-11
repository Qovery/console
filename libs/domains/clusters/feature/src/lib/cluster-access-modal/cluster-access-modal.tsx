import { type KubernetesEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { CopyButton, ExternalLink, Heading, Section } from '@qovery/shared/ui'

const CommandBlock = ({ command }: { command: string }) => (
  <div className="flex justify-between gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
    <div>
      <span className="select-none">$ </span>
      {command}
    </div>
    <CopyButton content={command} />
  </div>
)

const Step = ({ number, title, children }: PropsWithChildren<{ number: number; title: string }>) => (
  <li className="flex flex-col gap-2 rounded border border-neutral-250 px-4 py-3 text-sm">
    <span className="font-medium">
      {number}. {title}
    </span>
    {children}
  </li>
)

export interface ClusterAccessModalProps {
  clusterId: string
  type: Extract<KubernetesEnum, 'MANAGED' | 'SELF_MANAGED'>
}

export function ClusterAccessModal({ clusterId, type }: ClusterAccessModalProps) {
  const isSelfManaged = type === 'SELF_MANAGED'

  const commands = {
    kubeconfig: `qovery cluster kubeconfig --cluster-id ${clusterId}`,
    debugPod: `qovery cluster debug-pod --cluster-id ${clusterId}`,
    exportConfig: 'export KUBECONFIG=<path>',
    kubectl: 'kubectl',
    k9s: 'k9s',
  }

  return (
    <Section className="p-5">
      <Heading className="h4 max-w-sm truncate text-neutral-400">Access to your cluster</Heading>

      <p className="mb-6 mt-2 text-sm text-neutral-350">
        This section explains how to connect to your {isSelfManaged ? 'self-managed ' : ''}
        cluster using kubectl, k9s.
      </p>

      <ul className="flex flex-col gap-4">
        <Step number={1} title="Download/Update Qovery CLI">
          <p className="text-neutral-350">
            Download and install the Qovery CLI (or update its version to the latest version)
          </p>
          <ExternalLink href="https://hub.qovery.com/docs/using-qovery/interface/cli/#install">
            https://hub.qovery.com/docs/using-qovery/interface/cli/#install
          </ExternalLink>
        </Step>

        <Step number={2} title={isSelfManaged ? 'Run your debug pod' : 'Get your kubeconfig'}>
          <CommandBlock command={isSelfManaged ? commands.debugPod : commands.kubeconfig} />
        </Step>

        {!isSelfManaged && (
          <Step number={3} title="Export your kubeconfig">
            <p className="text-neutral-350">
              Replace the path from the previous command's output and run the following command in your terminal.
            </p>
            <CommandBlock command={commands.exportConfig} />
          </Step>
        )}

        <Step number={isSelfManaged ? 3 : 4} title="Use your favorite tool to access your cluster. Examples:">
          <CommandBlock command={commands.kubectl} />
          <CommandBlock command={commands.k9s} />
        </Step>
      </ul>
    </Section>
  )
}

export default ClusterAccessModal

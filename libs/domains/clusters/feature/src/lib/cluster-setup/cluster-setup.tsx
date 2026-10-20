import { Callout, CopyButton, ExternalLink, Icon } from '@qovery/shared/ui'
import { type OS, useOS } from '@qovery/shared/util-hooks'

const INSTALL_COMMANDS: Record<OS, string> = {
  macos: 'brew install Qovery/qovery-cli/qovery-cli',
  linux: 'curl -s https://get.qovery.com | bash',
  windows: 'scoop bucket add qovery https://github.com/Qovery/scoop-qovery-cli.git && scoop install qovery-cli',
}

export function ClusterSetup({ type }: { type: 'LOCAL_DEMO' | 'SELF_MANAGED' }) {
  const os = useOS()
  const clusterCommand = type === 'LOCAL_DEMO' ? 'qovery demo up' : 'qovery cluster install'
  const fullCommand = `${INSTALL_COMMANDS[os]} && ${clusterCommand}`

  return (
    <>
      {type === 'SELF_MANAGED' && (
        <Callout.Root color="sky" className="items-start">
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
      <ul className="flex flex-col gap-4 text-sm font-medium text-neutral">
        <li className="rounded border border-neutral p-3">
          <h5 className="mb-1 text-sm font-medium">
            1. {type === 'LOCAL_DEMO' ? 'Install Qovery CLI and your cluster' : 'Install Qovery CLI and your cluster'}
          </h5>
          <p className="mb-2 font-normal text-neutral-subtle">
            Run the following command from your terminal to install the Qovery CLI and start the installation.
          </p>
          <pre className="flex items-start justify-between gap-2 whitespace-pre-wrap break-all rounded-sm bg-surface-neutral-subtle p-3 font-mono text-neutral">
            <span>
              <span className="select-none">$ </span>
              {fullCommand}
            </span>
            <CopyButton content={fullCommand} />
          </pre>
          <ExternalLink className="mt-2" href="https://www.qovery.com/docs/cli/overview#installation">
            See all install options
          </ExternalLink>
        </li>
        <li className="rounded border border-neutral p-3">
          <h5 className="mb-1 text-sm font-medium">2. Deploy your first environment!</h5>
          <p className="font-normal text-neutral-subtle">
            Once the installation is completed, get back to the Qovery console and deploy your first environment on your
            brand new cluster.
          </p>
        </li>
      </ul>
    </>
  )
}

export default ClusterSetup

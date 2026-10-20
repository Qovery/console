import { type OS } from '@qovery/shared/util-hooks'

const INSTALL_COMMANDS: Record<OS, string> = {
  macos: 'brew install Qovery/qovery-cli/qovery-cli',
  linux: 'curl -s https://get.qovery.com | bash',
  windows: 'scoop bucket add qovery https://github.com/Qovery/scoop-qovery-cli.git && scoop install qovery-cli',
}

export function getClusterSetupCommand(os: OS, type: 'LOCAL_DEMO' | 'SELF_MANAGED') {
  const clusterCommand = type === 'LOCAL_DEMO' ? 'qovery demo up' : 'qovery cluster install'
  return `${INSTALL_COMMANDS[os]} && ${clusterCommand}`
}

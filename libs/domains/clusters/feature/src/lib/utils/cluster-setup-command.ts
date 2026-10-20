import { type OS } from '@qovery/shared/util-hooks'

const INSTALL_COMMANDS: Record<Exclude<OS, 'windows'>, string> = {
  macos: 'brew install Qovery/qovery-cli/qovery-cli',
  linux: 'curl -s https://get.qovery.com | bash',
}

export function getClusterSetupCommand(os: OS, type: 'LOCAL_DEMO' | 'SELF_MANAGED') {
  if (os === 'windows') {
    if (type === 'LOCAL_DEMO') {
      return `wsl bash -c '${INSTALL_COMMANDS.linux} && qovery demo up'`
    }
    return 'scoop bucket add qovery https://github.com/Qovery/scoop-qovery-cli.git; if ($?) { scoop install qovery-cli; if ($?) { qovery cluster install } }'
  }
  const clusterCommand = type === 'LOCAL_DEMO' ? 'qovery demo up' : 'qovery cluster install'
  return `${INSTALL_COMMANDS[os]} && ${clusterCommand}`
}

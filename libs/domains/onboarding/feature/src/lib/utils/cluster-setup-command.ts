import { type OS } from '@qovery/shared/util-hooks'

const INSTALL_COMMANDS = {
  macos: 'brew install Qovery/qovery-cli/qovery-cli',
  linux: 'curl -s https://get.qovery.com | bash',
}

export function getClusterSetupCommand(os: OS) {
  if (os === 'windows') {
    return `wsl bash -c '${INSTALL_COMMANDS.linux} && qovery demo up'`
  }
  return `${INSTALL_COMMANDS[os]} && qovery demo up`
}

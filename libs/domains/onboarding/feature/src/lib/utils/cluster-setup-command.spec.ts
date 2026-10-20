import { getClusterSetupCommand } from './cluster-setup-command'

it.each([
  ['macos', 'brew install Qovery/qovery-cli/qovery-cli && qovery demo up'],
  ['linux', `bash -o pipefail -c 'curl -fsS https://get.qovery.com | bash && qovery demo up'`],
  ['windows', "wsl bash -o pipefail -c 'curl -fsS https://get.qovery.com | bash && qovery demo up'"],
] as const)('provides the demo installation command for %s', (os, command) => {
  expect(getClusterSetupCommand(os)).toBe(command)
})

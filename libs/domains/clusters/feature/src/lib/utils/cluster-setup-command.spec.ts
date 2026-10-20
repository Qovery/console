import { getClusterSetupCommand } from './cluster-setup-command'

it.each([
  ['macos', 'LOCAL_DEMO', 'brew install Qovery/qovery-cli/qovery-cli && qovery demo up'],
  ['linux', 'LOCAL_DEMO', 'curl -s https://get.qovery.com | bash && qovery demo up'],
  ['macos', 'SELF_MANAGED', 'brew install Qovery/qovery-cli/qovery-cli && qovery cluster install'],
  ['linux', 'SELF_MANAGED', 'curl -s https://get.qovery.com | bash && qovery cluster install'],
] as const)('keeps the %s %s installation command', (os, type, command) => {
  expect(getClusterSetupCommand(os, type)).toBe(command)
})

it('runs the Windows demo inside WSL instead of the unsupported native CLI', () => {
  expect(getClusterSetupCommand('windows', 'LOCAL_DEMO')).toBe(
    "wsl bash -c 'curl -s https://get.qovery.com | bash && qovery demo up'"
  )
})

it('uses PowerShell 5.1 compatible conditional execution for self-managed Windows installs', () => {
  const command = getClusterSetupCommand('windows', 'SELF_MANAGED')
  expect(command).not.toContain('&&')
  expect(command).toBe(
    'scoop bucket add qovery https://github.com/Qovery/scoop-qovery-cli.git; if ($?) { scoop install qovery-cli; if ($?) { qovery cluster install } }'
  )
})

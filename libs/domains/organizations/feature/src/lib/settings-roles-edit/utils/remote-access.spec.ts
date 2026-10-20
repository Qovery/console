import { remoteAccessAfterLevelChange } from './remote-access'

describe('remoteAccessAfterLevelChange', () => {
  it('should turn the flag off with No access, keep it when it could already be granted, and default it otherwise', () => {
    expect(remoteAccessAfterLevelChange('DEPLOYER', 'NO_ACCESS', true)).toBe(false)
    expect(remoteAccessAfterLevelChange('VIEWER', 'DEPLOYER', false)).toBe(false)
    expect(remoteAccessAfterLevelChange('DEPLOYER', 'VIEWER', true)).toBe(true)
    expect(remoteAccessAfterLevelChange('NO_ACCESS', 'DEPLOYER', false)).toBe(true)
    expect(remoteAccessAfterLevelChange('NO_ACCESS', 'VIEWER', false)).toBe(false)
    expect(remoteAccessAfterLevelChange('ADMIN', 'MANAGER', false)).toBe(true)
    expect(remoteAccessAfterLevelChange(undefined, 'DEPLOYER', false)).toBe(true)
  })
})

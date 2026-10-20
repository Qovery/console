import { isPermissionDenied, permissionDeniedDescription } from './service-terminal'

describe('ServiceTerminal permission denied', () => {
  it('should recognize the websocket-gateway permission close reason', () => {
    expect(isPermissionDenied('Invalid permission: Your role has no shell permission on this environment')).toBe(true)
    expect(isPermissionDenied('Pod not found')).toBe(false)
  })

  it('should display the reason sent by the backend without the gateway prefix', () => {
    expect(
      permissionDeniedDescription('Invalid permission: Your role has no shell permission on this environment')
    ).toBe('Your role has no shell permission on this environment')
  })
})

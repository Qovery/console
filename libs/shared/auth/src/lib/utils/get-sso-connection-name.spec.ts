import { getSsoConnectionName } from './get-sso-connection-name'

describe('getSsoConnectionName', () => {
  it('should strip the TLD from a domain', () => {
    expect(getSsoConnectionName('qovery.com')).toBe('qovery')
  })

  it('should only strip the last segment', () => {
    expect(getSsoConnectionName('acme.co.uk')).toBe('acme.co')
  })

  it('should keep a connection name without dots as is', () => {
    expect(getSsoConnectionName('foobar')).toBe('foobar')
  })

  it('should trim whitespaces', () => {
    expect(getSsoConnectionName('  qovery.com ')).toBe('qovery')
  })
})

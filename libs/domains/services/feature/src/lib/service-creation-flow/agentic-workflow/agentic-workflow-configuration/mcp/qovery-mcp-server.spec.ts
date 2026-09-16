import { getMcpServerDisplayName, isQoveryMcpServer } from './qovery-mcp-server'

describe('isQoveryMcpServer', () => {
  it.each([
    'https://mcp.qovery.com',
    'https://mcp.qovery.com/',
    'https://mcp.qovery.com/mcp',
    'https://mcp.qovery.com/mcp/',
  ])('recognizes the Qovery MCP URL %s', (url) => {
    expect(isQoveryMcpServer({ url })).toBe(true)
  })

  it('rejects a custom MCP URL', () => {
    expect(isQoveryMcpServer({ url: 'https://example.com/mcp' })).toBe(false)
  })

  it.each([null, undefined])('rejects a missing MCP URL', (url) => {
    expect(isQoveryMcpServer({ url })).toBe(false)
  })
})

describe('getMcpServerDisplayName', () => {
  it('uses a consistent name for the Qovery MCP', () => {
    expect(getMcpServerDisplayName({ name: 'qovery', url: 'https://mcp.qovery.com/mcp' })).toBe('MCP Qovery')
  })

  it('keeps the original name for a custom MCP', () => {
    expect(getMcpServerDisplayName({ name: 'custom', url: 'https://example.com/mcp' })).toBe('custom')
  })
})

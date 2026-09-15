import { isQoveryMcpServer } from './qovery-mcp-server'

describe('isQoveryMcpServer', () => {
  it.each(['https://mcp.qovery.com/mcp', 'https://mcp.qovery.com/mcp/'])('recognizes the Qovery MCP URL %s', (url) => {
    expect(isQoveryMcpServer({ url })).toBe(true)
  })

  it('rejects a custom MCP URL', () => {
    expect(isQoveryMcpServer({ url: 'https://example.com/mcp' })).toBe(false)
  })
})

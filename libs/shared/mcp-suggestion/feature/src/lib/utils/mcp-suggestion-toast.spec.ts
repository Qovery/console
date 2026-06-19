import { showMcpSuggestionToast } from './mcp-suggestion-toast'

describe('MCP suggestion toast', () => {
  it('should dispatch the suggestion event', () => {
    const listener = jest.fn()
    window.addEventListener('qovery:skill-suggestion', listener)

    showMcpSuggestionToast({ type: 'service', name: 'my-service' })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].detail).toMatchObject({
      type: 'service',
      name: 'my-service',
    })

    window.removeEventListener('qovery:skill-suggestion', listener)
  })
})

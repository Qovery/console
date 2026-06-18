import { showMcpSuggestionToast } from './mcp-suggestion-toast'
import { MCP_SUGGESTION_DISMISSED_KEY, dismissMcpSuggestionToast } from './mcp-suggestion-toast-storage'

describe('MCP suggestion toast', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should dispatch the suggestion event when it has not been dismissed', () => {
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

  it('should not dispatch the suggestion event when it was dismissed', () => {
    const listener = jest.fn()
    window.addEventListener('qovery:skill-suggestion', listener)
    localStorage.setItem(MCP_SUGGESTION_DISMISSED_KEY, '1')

    showMcpSuggestionToast({ type: 'service', name: 'my-service' })

    expect(listener).not.toHaveBeenCalled()

    window.removeEventListener('qovery:skill-suggestion', listener)
  })

  it('should store the dismissal flag', () => {
    dismissMcpSuggestionToast()

    expect(localStorage.getItem(MCP_SUGGESTION_DISMISSED_KEY)).toBe('1')
  })
})

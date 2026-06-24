import { type McpSuggestionAction } from '../mcp-suggestion-toast/mcp-suggestion-toast'

export function showMcpSuggestionToast(action: McpSuggestionAction): void {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent('qovery:skill-suggestion', { detail: action }))
}

import { type McpSuggestionAction } from '../components/mcp-suggestion-toast/mcp-suggestion-toast'
import { isMcpSuggestionToastDismissed } from './mcp-suggestion-toast-storage'

export function showMcpSuggestionToast(action: McpSuggestionAction): void {
  if (typeof window === 'undefined') return
  if (isMcpSuggestionToastDismissed()) return

  window.dispatchEvent(new CustomEvent('qovery:skill-suggestion', { detail: action }))
}

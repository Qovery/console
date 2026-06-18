export const MCP_SUGGESTION_DISMISSED_KEY = 'qovery_skill_suggestion_dismissed'

export function isMcpSuggestionToastDismissed(): boolean {
  if (typeof window === 'undefined') return false

  return localStorage.getItem(MCP_SUGGESTION_DISMISSED_KEY) !== null
}

export function dismissMcpSuggestionToast(): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(MCP_SUGGESTION_DISMISSED_KEY, '1')
}

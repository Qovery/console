import { AI_TOOL_NAMES, type McpSuggestionAction } from '../components/mcp-suggestion-toast/mcp-suggestion-toast'

const DISMISSED_KEY = 'qovery_skill_suggestion_dismissed'
const AI_INDEX_KEY = 'qovery_skill_ai_index'

export function showMcpSuggestionToast(action: McpSuggestionAction): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(DISMISSED_KEY)) return

  const currentIndex = parseInt(localStorage.getItem(AI_INDEX_KEY) ?? '0', 10)
  const aiName = AI_TOOL_NAMES[currentIndex % AI_TOOL_NAMES.length]
  localStorage.setItem(AI_INDEX_KEY, String((currentIndex + 1) % AI_TOOL_NAMES.length))

  window.dispatchEvent(new CustomEvent('qovery:skill-suggestion', { detail: { ...action, aiName } }))
}

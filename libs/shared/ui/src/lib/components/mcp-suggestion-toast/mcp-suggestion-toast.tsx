import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import AnimatedGradientText from '../animated-gradient-text/animated-gradient-text'
import Button from '../button/button'
import { Icon } from '../icon/icon'

export const SKILL_INSTALL_COMMAND = 'curl -fsSL https://skill.qovery.com/install.sh | bash'

const DISMISSED_KEY = 'qovery_skill_suggestion_dismissed'

export type McpSuggestionActionType = 'service' | 'environment' | 'cluster' | 'project'

export interface McpSuggestionAction {
  type: McpSuggestionActionType
  name: string
}

export const AI_TOOL_NAMES = ['Claude', 'Gemini', 'Cursor', 'OpenCode'] as const

const PROMPTS: Record<McpSuggestionActionType, (name: string) => string> = {
  service: (name) => `Deploy my application "${name}" on Qovery and check its health`,
  environment: (name) => `Deploy my services to the "${name}" environment on Qovery`,
  cluster: (name) => `I just provisioned the "${name}" cluster on Qovery, help me deploy my first application`,
  project: (name) =>
    `I just created project "${name}" on Qovery, help me structure my environments and deploy my services`,
}

interface McpSuggestionEvent extends McpSuggestionAction {
  aiName: string
}

interface McpSuggestionPanelProps {
  event: McpSuggestionEvent
  onClose: () => void
}

const CAROUSEL_SLOT_S = 2.8
const CAROUSEL_TOTAL_S = CAROUSEL_SLOT_S * AI_TOOL_NAMES.length

function McpSuggestionPanel({ event, onClose }: McpSuggestionPanelProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [promptCopied, setPromptCopied] = useState(false)
  const [cmdCopied, setCmdCopied] = useState(false)

  const prompt = PROMPTS[event.type](event.name)

  const handleCopyPrompt = () => {
    copyToClipboard(prompt)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 1500)
  }

  const handleCopyCmd = () => {
    copyToClipboard(SKILL_INSTALL_COMMAND)
    setCmdCopied(true)
    setTimeout(() => setCmdCopied(false), 1500)
  }

  const initialIndex = Math.max(0, AI_TOOL_NAMES.indexOf(event.aiName as (typeof AI_TOOL_NAMES)[number]))

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[500px] rounded-xl border border-neutral-component bg-surface-neutral font-sans shadow-lg">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="flex flex-wrap items-center gap-1 text-sm font-semibold text-neutral">
            <Icon iconName="sparkles" iconStyle="regular" className="text-brand" />
            <span>Next time, ask</span>
            <span className="inline-grid grid-cols-[max-content] justify-items-center align-middle">
              {AI_TOOL_NAMES.map((name, i) => {
                const slot = (i - initialIndex + AI_TOOL_NAMES.length) % AI_TOOL_NAMES.length
                const delay = slot === 0 ? 0 : -(CAROUSEL_TOTAL_S - slot * CAROUSEL_SLOT_S)
                return (
                  <span
                    key={name}
                    className="col-start-1 row-start-1 animate-[aiCarousel_11.2s_ease_infinite] opacity-0"
                    style={{ animationDelay: `${delay}s` }}
                  >
                    <AnimatedGradientText className="whitespace-nowrap font-bold">{name}</AnimatedGradientText>
                  </span>
                )
              })}
            </span>
            <span>to do it for you:</span>
          </p>
          <Button
            type="button"
            size="xs"
            variant="plain"
            color="neutral"
            iconOnly
            aria-label="Dismiss"
            className="-mr-1 -mt-1 shrink-0 text-neutral-subtle hover:bg-transparent hover:text-neutral"
            onClick={onClose}
          >
            <Icon iconName="xmark" iconStyle="regular" />
          </Button>
        </div>

        <div className="mt-3">
          <p className="mb-1 text-xs text-neutral-subtle">Example prompt</p>
          <div className="flex items-start gap-2 rounded-lg bg-surface-neutral-component px-3 py-2">
            <p className="flex-1 text-ssm italic text-neutral">"{prompt}"</p>
            <Button
              type="button"
              size="xs"
              variant="plain"
              color="neutral"
              iconOnly
              aria-label="Copy prompt"
              className="mt-0.5 shrink-0 text-neutral-subtle hover:bg-transparent hover:text-neutral"
              onClick={handleCopyPrompt}
            >
              <Icon iconName={promptCopied ? 'check' : 'copy'} iconStyle="regular" />
            </Button>
          </div>
        </div>

        <div className="mt-2">
          <p className="mb-1 text-xs text-neutral-subtle">Install Qovery skills</p>
          <div className="flex items-center gap-2 rounded-lg bg-surface-neutral-component px-3 py-1.5">
            <code className="flex-1 truncate font-mono text-xs text-neutral">{SKILL_INSTALL_COMMAND}</code>
            <Button
              type="button"
              size="xs"
              variant="plain"
              color="neutral"
              iconOnly
              aria-label="Copy install command"
              className="shrink-0 text-neutral-subtle hover:bg-transparent hover:text-neutral"
              onClick={handleCopyCmd}
            >
              <Icon iconName={cmdCopied ? 'check' : 'copy'} iconStyle="regular" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PortalState {
  visible: boolean
  event: McpSuggestionEvent
}

export function McpSuggestionPortal() {
  const [state, setState] = useState<PortalState>({
    visible: false,
    event: { type: 'service', name: '', aiName: 'Claude' },
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<McpSuggestionEvent>
      if (localStorage.getItem(DISMISSED_KEY)) return
      setState({ visible: true, event: ev.detail })
    }
    window.addEventListener('qovery:skill-suggestion', handler)
    return () => window.removeEventListener('qovery:skill-suggestion', handler)
  }, [])

  const handleClose = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setState((s) => ({ ...s, visible: false }))
  }

  if (!state.visible) return null

  return createPortal(<McpSuggestionPanel event={state.event} onClose={handleClose} />, document.body)
}

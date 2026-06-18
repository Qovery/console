import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { type ReactNode, useEffect, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { dismissMcpSuggestionToast, isMcpSuggestionToastDismissed } from '../../utils/mcp-suggestion-toast-storage'
import { AiToolBadge, DEFAULT_AI_TOOL_NAME } from '../ai-tool-badge/ai-tool-badge'
import Button from '../button/button'
import { CopyToClipboardButtonIcon } from '../copy-to-clipboard-button-icon/copy-to-clipboard-button-icon'
import { FloatingStackPortal } from '../floating-stack-portal/floating-stack-portal'
import { Icon } from '../icon/icon'

export const SKILL_INSTALL_COMMAND = 'curl -fsSL https://skill.qovery.com/install.sh | bash'

export type McpSuggestionActionType = 'service' | 'environment' | 'cluster' | 'project'

export interface McpSuggestionAction {
  type: McpSuggestionActionType
  name: string
  serviceType?: string
  clusterType?: string
  environmentType?: string
}

const MCP_SUGGESTION_AUTO_HIDE_MS = 30_000
const EASE_OUT_QUAD = [0.25, 0.46, 0.45, 0.94] as const
const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const
const MCP_SUGGESTION_ENTER_DURATION_SECONDS = 0.34
const MCP_SUGGESTION_EXIT_DURATION_SECONDS = 0.2
const MCP_SUGGESTION_SLIDE_OFFSET = 12

function toastMotion(reducedMotion: boolean) {
  return {
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: MCP_SUGGESTION_SLIDE_OFFSET },
    animate: reducedMotion
      ? { opacity: 1, transition: { duration: MCP_SUGGESTION_ENTER_DURATION_SECONDS, ease: EASE_OUT_QUAD } }
      : { opacity: 1, y: 0, transition: { duration: MCP_SUGGESTION_ENTER_DURATION_SECONDS, ease: EASE_OUT_QUART } },
    exit: reducedMotion
      ? { opacity: 0, transition: { duration: MCP_SUGGESTION_EXIT_DURATION_SECONDS, ease: EASE_OUT_QUAD } }
      : {
          opacity: 0,
          y: MCP_SUGGESTION_SLIDE_OFFSET,
          transition: { duration: MCP_SUGGESTION_EXIT_DURATION_SECONDS, ease: EASE_OUT_QUAD },
        },
  }
}

function McpInstallCommand() {
  return (
    <div className="flex items-center justify-between gap-1.5 rounded-md bg-surface-neutral-component py-0.5 pl-2 pr-1">
      <code className="min-w-0 overflow-x-auto whitespace-nowrap font-mono text-[11px] leading-4 text-neutral">
        {SKILL_INSTALL_COMMAND}
      </code>
      <CopyToClipboardButtonIcon
        content={SKILL_INSTALL_COMMAND}
        tooltipContent="Copy install command"
        className="shrink-0 p-1 text-sm text-neutral-subtle hover:text-neutral"
      />
    </div>
  )
}

export interface McpSuggestionCardProps {
  title?: ReactNode
  description?: ReactNode
  aiName?: string
  animatedBadge?: boolean
  variant?: 'compact' | 'setup'
  className?: string
}

export function McpSuggestionCard({
  title = 'Try deploying with',
  description,
  aiName = DEFAULT_AI_TOOL_NAME,
  animatedBadge = true,
  variant = 'compact',
  className,
}: McpSuggestionCardProps) {
  return (
    <div
      className={twMerge(
        'flex w-full flex-col gap-3 rounded-md border border-neutral bg-surface-neutral p-3 font-sans',
        variant === 'setup' && 'p-4',
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="flex flex-wrap items-center gap-1 text-ssm font-medium text-neutral">
          <span>{title}</span>
          <AiToolBadge key={aiName} initialName={aiName} animated={animatedBadge} />
        </p>
        {description && <p className="text-ssm text-neutral-subtle">{description}</p>}
      </div>
      <McpInstallCommand />
    </div>
  )
}

function formatServiceType(serviceType?: string): string {
  return serviceType?.toLowerCase().replace(/_/g, ' ') ?? 'service'
}

function formatClusterType(clusterType?: string): string {
  return clusterType?.replace(/_/g, ' ') ?? 'Kubernetes'
}

function formatEnvironmentType(environmentType?: string): string {
  return environmentType?.toLowerCase().replace(/_/g, ' ') ?? 'environment'
}

function getIndefiniteArticle(value: string): string {
  return /^[aeiou]/i.test(value) ? 'an' : 'a'
}

const PROMPTS: Record<McpSuggestionActionType, (action: McpSuggestionAction) => string> = {
  service: ({ name, serviceType }) => `Deploy my ${formatServiceType(serviceType)} ${name} on Qovery`,
  environment: ({ name, environmentType }) => {
    const formattedEnvironmentType = formatEnvironmentType(environmentType)
    return `Create ${getIndefiniteArticle(formattedEnvironmentType)} ${formattedEnvironmentType} environment called ${name}`
  },
  cluster: ({ clusterType }) => `Deploy my ${formatClusterType(clusterType)} cluster on Qovery`,
  project: ({ name }) => `Create a project named ${name} in Qovery`,
}

const TITLE_ACTIONS: Record<McpSuggestionActionType, string> = {
  service: 'deploying it',
  environment: 'creating this environment',
  cluster: 'creating this cluster',
  project: 'creating this project',
}

interface McpSuggestionPanelProps {
  event: McpSuggestionAction
  onClose: () => void
}

function McpSuggestionPanel({ event, onClose }: McpSuggestionPanelProps) {
  const prompt = PROMPTS[event.type](event)
  const titleAction = TITLE_ACTIONS[event.type]

  return (
    <div className="w-full overflow-hidden rounded-lg border border-neutral-component bg-surface-neutral font-sans shadow-lg">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="flex flex-wrap items-center gap-1 text-ssm font-medium text-neutral">
              <span>Next time, try {titleAction} with</span>
              <AiToolBadge />
            </p>
            <p className="break-words text-ssm text-neutral-subtle">"{prompt}"</p>
          </div>
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

        <McpInstallCommand />
      </div>
    </div>
  )
}

interface PortalState {
  visible: boolean
  event: McpSuggestionAction
}

export function McpSuggestionPortal() {
  const reducedMotion = useReducedMotion()
  const [isPortalMounted, setIsPortalMounted] = useState(false)
  const [state, setState] = useState<PortalState>({
    visible: false,
    event: { type: 'service', name: '' },
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<McpSuggestionAction>
      if (isMcpSuggestionToastDismissed()) return
      setIsPortalMounted(true)
      setState({ visible: true, event: ev.detail })
    }
    window.addEventListener('qovery:skill-suggestion', handler)
    return () => window.removeEventListener('qovery:skill-suggestion', handler)
  }, [])

  useEffect(() => {
    if (!state.visible) return

    const timeout = window.setTimeout(() => {
      setState((s) => ({ ...s, visible: false }))
    }, MCP_SUGGESTION_AUTO_HIDE_MS)

    return () => window.clearTimeout(timeout)
  }, [state.event, state.visible])

  const handleClose = () => {
    dismissMcpSuggestionToast()
    setState((s) => ({ ...s, visible: false }))
  }

  if (!isPortalMounted) return null

  return (
    <FloatingStackPortal position="bottom">
      <AnimatePresence onExitComplete={() => setIsPortalMounted(false)}>
        {state.visible && (
          <motion.div key="mcp-suggestion-toast" className="w-full" {...toastMotion(!!reducedMotion)}>
            <McpSuggestionPanel event={state.event} onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </FloatingStackPortal>
  )
}

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { type ReactNode, useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { twMerge } from '@qovery/shared/util-js'
import { dismissMcpSuggestionToast, isMcpSuggestionToastDismissed } from '../../utils/mcp-suggestion-toast-storage'
import { AiToolBadge } from '../ai-tool-badge/ai-tool-badge'
import Button from '../button/button'
import { CopyToClipboardButtonIcon } from '../copy-to-clipboard-button-icon/copy-to-clipboard-button-icon'
import { FloatingStackPortal } from '../floating-stack-portal/floating-stack-portal'
import { Icon } from '../icon/icon'

export type McpSuggestionAction =
  | { type: 'service'; name: string; serviceType?: string }
  | { type: 'environment'; name: string; environmentType?: string }
  | { type: 'cluster'; name: string; clusterType?: string }
  | { type: 'project'; name: string }

export type McpSuggestionActionType = McpSuggestionAction['type']

function McpInstallCommand() {
  const installCommand = 'curl -fsSL https://skill.qovery.com/install.sh | bash'

  return (
    <div className="flex items-center justify-between gap-1.5 rounded-md bg-surface-neutral-component py-0.5 pl-2 pr-1">
      <code className="min-w-0 overflow-x-auto whitespace-nowrap font-mono text-[11px] leading-4 text-neutral">
        {installCommand}
      </code>
      <CopyToClipboardButtonIcon
        content={installCommand}
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
  variant?: 'compact' | 'setup'
  className?: string
  onClose?: () => void
}

export function McpSuggestionCard({
  title = 'Try deploying with',
  description,
  aiName = 'Claude',
  variant = 'compact',
  className,
  onClose,
}: McpSuggestionCardProps) {
  return (
    <div
      className={twMerge(
        'flex w-full flex-col gap-3 overflow-hidden rounded-md border border-neutral bg-surface-neutral p-3 font-sans',
        variant === 'setup' && 'p-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="flex flex-wrap items-center gap-1 text-ssm font-medium text-neutral">
            <span>{title}</span>
            <AiToolBadge key={aiName} initialName={aiName} />
          </p>
          {description && <p className="break-words text-ssm text-neutral-subtle">{description}</p>}
        </div>
        {onClose && (
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
        )}
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

function getPrompt(action: McpSuggestionAction): string {
  return match(action)
    .with(
      { type: 'service' },
      ({ name, serviceType }) => `Deploy my ${formatServiceType(serviceType)} ${name} on Qovery`
    )
    .with({ type: 'environment' }, ({ name, environmentType }) => {
      const formattedEnvironmentType = formatEnvironmentType(environmentType)
      return `Create ${getIndefiniteArticle(formattedEnvironmentType)} ${formattedEnvironmentType} environment called ${name}`
    })
    .with({ type: 'cluster' }, ({ clusterType }) => `Deploy my ${formatClusterType(clusterType)} cluster on Qovery`)
    .with({ type: 'project' }, ({ name }) => `Create a project named ${name} in Qovery`)
    .exhaustive()
}

const TITLE_ACTIONS: Record<McpSuggestionActionType, string> = {
  service: 'deploying it',
  environment: 'creating this environment',
  cluster: 'creating this cluster',
  project: 'creating this project',
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
    }, 30_000)

    return () => window.clearTimeout(timeout)
  }, [state.event, state.visible])

  const handleClose = () => {
    dismissMcpSuggestionToast()
    setState((s) => ({ ...s, visible: false }))
  }

  if (!isPortalMounted) return null

  const prompt = getPrompt(state.event)
  const titleAction = TITLE_ACTIONS[state.event.type]

  return (
    <FloatingStackPortal position="bottom">
      <AnimatePresence onExitComplete={() => setIsPortalMounted(false)}>
        {state.visible && (
          <motion.div
            key="mcp-suggestion-toast"
            className="w-full"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={
              reducedMotion
                ? { opacity: 1, transition: { duration: 0.34, ease: [0.25, 0.46, 0.45, 0.94] } }
                : { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.165, 0.84, 0.44, 1] } }
            }
            exit={
              reducedMotion
                ? { opacity: 0, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }
                : { opacity: 0, y: 12, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }
            }
          >
            <McpSuggestionCard
              variant="setup"
              title={`Next time, try ${titleAction} with`}
              description={`"${prompt}"`}
              className="rounded-xl shadow-lg"
              onClose={handleClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </FloatingStackPortal>
  )
}

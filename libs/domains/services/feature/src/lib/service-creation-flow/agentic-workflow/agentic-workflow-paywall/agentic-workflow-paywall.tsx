import { useParams } from '@tanstack/react-router'
import type { GateIntro } from 'qovery-pricing-typescript-axios'
import { type ReactNode, useState } from 'react'
import { GatedPage, useBillingPaywall, usePricingClient } from '@qovery/shared/billing/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'

export const AGENTIC_WORKFLOW_CREATE_ACTION = 'agentic_workflow.create'

export interface AgenticWorkflowPaywallProps {
  /** "Not now": back to the environment's Automations tab. */
  onExit: () => void
  children: ReactNode
}

/**
 * Opening the agent task creation flow (from a template, from scratch or a deep link) without
 * agent tasks in the plan shows the full-page paywall instead of the flow. With agent tasks in the
 * plan, the first opening shows the intro when staff turned it on: Continue shows the flow, Not now
 * goes back to Automations.
 */
export function AgenticWorkflowPaywall({ onExit, children }: AgenticWorkflowPaywallProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { showChat } = useSupportChat()
  const client = usePricingClient()
  const paywall = useBillingPaywall(organizationId, { actions: [AGENTIC_WORKFLOW_CREATE_ACTION] })
  // Held once read: showing the intro marks it seen, so the gate no longer offers it.
  const due = paywall.intro(AGENTIC_WORKFLOW_CREATE_ACTION)
  const [intro, setIntro] = useState<GateIntro | null>()
  const [continued, setContinued] = useState(false)
  if (due && intro === undefined) setIntro(due)

  if (paywall.pending) return <LoaderSpinner />

  if (!paywall.locked(AGENTIC_WORKFLOW_CREATE_ACTION)) {
    if (!intro || continued) return children
    return (
      <GatedPage
        organizationId={organizationId}
        client={client}
        intro={intro}
        overlay
        onContinue={() => setContinued(true)}
        onClose={onExit}
      />
    )
  }

  return (
    <GatedPage
      organizationId={organizationId}
      client={client}
      gate={paywall.gate(AGENTIC_WORKFLOW_CREATE_ACTION)}
      overlay
      onContactSales={showChat}
      keepOpenAfterDone
      onDone={paywall.reload}
      onClose={onExit}
    />
  )
}

export default AgenticWorkflowPaywall

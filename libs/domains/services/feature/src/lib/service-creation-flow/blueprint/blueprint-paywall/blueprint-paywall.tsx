import { useParams } from '@tanstack/react-router'
import { type ReactNode, useRef, useState } from 'react'
import { type GateIntro, GatedPage, useBillingPaywall, usePricingClient } from '@qovery/shared/billing-kit'
import { useSupportChat } from '@qovery/shared/util-hooks'

export interface BlueprintPaywallProps {
  /** "Not now": back to the service catalog. */
  onExit: () => void
  children: ReactNode
}

/**
 * Opening a blueprint without blueprints in the plan (from the catalog or a deep link) shows the
 * full-page paywall instead of the creation flow. Other service types are never gated here.
 * With blueprints in the plan, the first opening shows the intro when staff turned it on:
 * Continue shows the flow, Not now goes back to the catalog.
 */
export function BlueprintPaywall({ onExit, children }: BlueprintPaywallProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { showChat } = useSupportChat()
  const client = usePricingClient()
  const paywall = useBillingPaywall(organizationId, { actions: ['blueprint.create'] })
  // After a trial or a plan change, the gates are read again and the flow shows: no exit then.
  const finished = useRef(false)
  // Held once read: showing the intro marks it seen, so the gate no longer offers it.
  const due = paywall.intro('blueprint.create')
  const [intro, setIntro] = useState<GateIntro | null>()
  const [continued, setContinued] = useState(false)
  if (due && intro === undefined) setIntro(due)

  if (!paywall.locked('blueprint.create')) {
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
      gate={paywall.gate('blueprint.create')}
      overlay
      onContactSales={showChat}
      onDone={() => {
        finished.current = true
        paywall.reload()
      }}
      onClose={() => {
        if (!finished.current) onExit()
      }}
    />
  )
}

export default BlueprintPaywall

import { useParams } from '@tanstack/react-router'
import type { GateIntro } from 'qovery-pricing-typescript-axios'
import { type ReactNode, useState } from 'react'
import { GatedPage, useBillingPaywall, usePricingClient } from '@qovery/shared/billing/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
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
  // Held once read: showing the intro marks it seen, so the gate no longer offers it.
  const due = paywall.intro('blueprint.create')
  const [intro, setIntro] = useState<GateIntro | null>()
  const [continued, setContinued] = useState(false)
  if (due && intro === undefined) setIntro(due)

  if (paywall.pending) return <LoaderSpinner />

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
      keepOpenAfterDone
      onDone={paywall.reload}
      onClose={onExit}
    />
  )
}

export default BlueprintPaywall

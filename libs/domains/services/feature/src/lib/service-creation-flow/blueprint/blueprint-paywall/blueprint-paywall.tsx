import { useParams } from '@tanstack/react-router'
import { type ReactNode, useRef } from 'react'
import { GatedPage, useBillingPaywall, usePricingClient } from '@qovery/shared/billing-kit'
import { useSupportChat } from '@qovery/shared/util-hooks'

export interface BlueprintPaywallProps {
  /** "Not now": back to the service catalog. */
  onExit: () => void
  children: ReactNode
}

/**
 * Opening a blueprint without blueprints in the plan (from the catalog or a deep link) shows the
 * full-page paywall instead of the creation flow. Other service types are never gated here.
 */
export function BlueprintPaywall({ onExit, children }: BlueprintPaywallProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { showChat } = useSupportChat()
  const client = usePricingClient()
  const paywall = useBillingPaywall(organizationId, { actions: ['blueprint.create'] })
  // After a trial or a plan change, the gates are read again and the flow shows: no exit then.
  const finished = useRef(false)

  if (!paywall.locked('blueprint.create')) return children

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

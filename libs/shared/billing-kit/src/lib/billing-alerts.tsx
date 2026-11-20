/*
 * <BillingAlerts>: what needs the billing roles' attention, for any page or the console's
 * layout: an overdue invoice, a card that expired or expires soon. Nothing for members (the
 * invoice and payment APIs are not called), nothing when all is well.
 *
 *   <BillingAlerts organizationId={id} client={client} onNavigate={(to) => navigate(to === 'invoices' ? invoicesUrl : billingUrl)} />
 */
import { useEffect, useState } from 'react'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import type { PricingClient } from './client'
import { type Access, isBillingAccess, useAccess } from './parts'
import { amount, amountDue, cardState } from './rules'
import type { CustomerInvoice, PaymentMethods } from './types'

export interface BillingAlertsProps {
  organizationId: string
  client: PricingClient
  /** Opens the invoices page or the billing settings page. */
  onNavigate?: (to: 'invoices' | 'billing') => void
  /** Hide one kind when the page already shows it (the invoices page has its own overdue banner). */
  hide?: ('overdue' | 'card')[]
  access?: Access
}

export function BillingAlerts({ organizationId, client, onNavigate, hide = [], access: given }: BillingAlertsProps) {
  const access = useAccess(client, organizationId, given)
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([])
  const [pm, setPm] = useState<PaymentMethods>()
  useEffect(() => {
    if (!isBillingAccess(access)) return
    let live = true
    if (!hide.includes('overdue'))
      client
        .invoices?.(organizationId)
        .then((p) => live && setInvoices(p.billing_channel === 'aws_marketplace' ? [] : p.invoices))
        .catch(() => undefined)
    if (!hide.includes('card'))
      client
        .paymentMethods?.(organizationId)
        .then((x) => live && setPm(x))
        .catch(() => undefined)
    return () => {
      live = false
    }
  }, [access, client, organizationId, hide.join()]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!isBillingAccess(access)) return null
  const due = amountDue(invoices)
  const primary =
    pm && pm.billing_channel !== 'aws_marketplace'
      ? pm.payment_methods.find((m) => m.primary) ?? pm.payment_methods[0]
      : undefined
  const card = primary ? cardState(primary) : 'ok'
  if (due.length === 0 && card === 'ok') return null
  return (
    <div className="flex flex-col gap-3">
      {due.length > 0 && (
        <Callout.Root color="red">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>{due.map((d) => amount(d.amount, d.currency)).join(' + ')} is due</Callout.TextHeading>
            Pay the unpaid invoice{due.reduce((n, d) => n + d.count, 0) > 1 ? 's' : ''} to keep deploying without
            interruption.
            {onNavigate && (
              <div className="mt-2">
                <Button size="sm" color="red" onClick={() => onNavigate('invoices')}>
                  View invoices
                </Button>
              </div>
            )}
          </Callout.Text>
        </Callout.Root>
      )}
      {card !== 'ok' && primary && (
        <Callout.Root color={card === 'expired' ? 'red' : 'yellow'}>
          <Callout.Icon>
            <Icon iconName="credit-card" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>
              {card === 'expired' ? 'Your card has expired' : 'Your card expires soon'}
            </Callout.TextHeading>
            The card ending in {primary.last4 ?? '····'} {card === 'expired' ? 'expired' : 'expires'}{' '}
            {primary.expiry_month ? `${String(primary.expiry_month).padStart(2, '0')}/${primary.expiry_year}` : ''}.
            Update it so invoices are paid automatically.
            {onNavigate && (
              <div className="mt-2">
                <Button size="sm" variant="outline" color="neutral" onClick={() => onNavigate('billing')}>
                  Update payment method
                </Button>
              </div>
            )}
          </Callout.Text>
        </Callout.Root>
      )}
    </div>
  )
}

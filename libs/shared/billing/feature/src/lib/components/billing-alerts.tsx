/*
 * <BillingAlerts>: what needs the billing roles' attention, for any page or the console's
 * layout: an overdue invoice, a card that expired or expires soon. Nothing for members (the
 * invoice and payment APIs are not called), nothing when all is well.
 *
 *   <BillingAlerts organizationId={id} client={client} onNavigate={(to) => navigate(to === 'invoices' ? invoicesUrl : billingUrl)} />
 */
import { useEffect, useState } from 'react'
import type { CustomerInvoice, PaymentMethods, PricingClient } from '@qovery/shared/billing/data-access'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import { amount, amountDue, cardState } from '../utils/rules'
import { type Access, isBillingAccess, useAccess } from './parts'

export interface BillingAlertsProps {
  organizationId: string
  client: PricingClient
  /** Opens the invoices page or the billing settings page. */
  onNavigate?: (to: 'invoices' | 'billing') => void
  /** Hide one kind when the page already shows it (the invoices page has its own overdue banner). */
  hide?: ('overdue' | 'card')[]
  access?: Access
  paymentMethods?: { data?: PaymentMethods }
}

export function BillingAlerts({
  organizationId,
  client,
  onNavigate,
  hide,
  access: given,
  paymentMethods,
}: BillingAlertsProps) {
  const { access } = useAccess(client, organizationId, given)
  const showOverdue = !hide?.includes('overdue')
  const showCard = !hide?.includes('card')
  const loadCard = showCard && !paymentMethods
  const [invoices, setInvoices] = useState<{ organizationId: string; data: CustomerInvoice[] }>()
  const [cardResult, setCardResult] = useState<{ organizationId: string; data: PaymentMethods }>()
  useEffect(() => {
    if (!isBillingAccess(access)) return
    let live = true
    if (showOverdue)
      client
        .invoices?.(organizationId)
        .then(
          (p) =>
            live && setInvoices({ organizationId, data: p.billing_channel === 'aws_marketplace' ? [] : p.invoices })
        )
        .catch(() => undefined)
    if (loadCard)
      client
        .paymentMethods?.(organizationId)
        .then((x) => live && setCardResult({ organizationId, data: x }))
        .catch(() => undefined)
    return () => {
      live = false
    }
  }, [access, client, organizationId, showOverdue, loadCard])
  if (!isBillingAccess(access)) return null
  const due = amountDue(showOverdue && invoices?.organizationId === organizationId ? invoices.data : [])
  const pm = paymentMethods
    ? paymentMethods.data
    : cardResult?.organizationId === organizationId
      ? cardResult.data
      : undefined
  const primary =
    showCard && pm && pm.billing_channel !== 'aws_marketplace'
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

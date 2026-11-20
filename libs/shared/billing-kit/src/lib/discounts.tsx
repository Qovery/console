/*
 * Discounts in exchange for counterparts, on the usage page (billing roles): the discounts this
 * organization may ask for, each with what it asks in return and its percentage, picked with
 * checkboxes that follow the rules (two and three years exclude each other; paying the term up
 * front needs one), the price with the selection priced by pricing-api, the terms to accept, and
 * "Request discount". Qovery reviews each request: the card then shows it under review (with
 * Withdraw), approved (and until when) or declined (with the reason).
 */
import { useEffect, useState } from 'react'
import { Badge, Button, Callout, Checkbox, Icon, InputTextArea } from '@qovery/shared/ui'
import { BillingError, type PricingClient } from './client'
import { date, money } from './format'
import { errorText, notifySuccess } from './parts'
import { currentDiscountRequest, discountPercent, discountSelectable, toggleDiscount } from './rules'
import type { BillingUsage, DiscountQuote, DiscountRequest, Discounts } from './types'

const pct = (p: number) => `${Number.isInteger(p) ? p : p.toFixed(1)}%`

export function DiscountsCard({
  organizationId,
  client,
  usage,
  onChanged,
}: {
  organizationId: string
  client: PricingClient
  usage: BillingUsage
  onChanged?: () => void
}) {
  const billing = usage.access !== 'member' && !usage.billing.internal && !!client.discounts
  const [view, setView] = useState<Discounts>()
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [quote, setQuote] = useState<DiscountQuote>()
  const [quoteError, setQuoteError] = useState('')
  const [terms, setTerms] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  // A pricing-api without discounts (404) shows no card rather than an error.
  const load = () =>
    client
      .discounts?.(organizationId)
      .then((v) => {
        setView(v)
        setError('')
      })
      .catch((e) => setError(e instanceof BillingError && e.status === 404 ? '' : errorText(e)))
  useEffect(() => {
    if (billing) load()
  }, [client, organizationId, billing]) // eslint-disable-line react-hooks/exhaustive-deps

  // The new price comes from pricing-api's engine, a dry run on every change of the selection.
  useEffect(() => {
    if (!client.quoteDiscounts || selected.length === 0) {
      setQuote(undefined)
      setQuoteError('')
      return
    }
    let live = true
    client
      .quoteDiscounts(organizationId, selected)
      .then((q) => {
        if (live) {
          setQuote(q)
          setQuoteError('')
        }
      })
      .catch((e) => {
        if (live) {
          setQuote(undefined)
          setQuoteError(errorText(e))
        }
      })
    return () => {
      live = false
    }
  }, [client, organizationId, selected.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!billing) return null
  if (error)
    return (
      <Callout.Root color="red">
        <Callout.Text>{error}</Callout.Text>
      </Callout.Root>
    )
  if (!view || !view.availability.available) return null
  const cur = view.currency
  const per = view.period === 'year' ? 'year' : 'month'
  const running = view.requests.filter((r) => r.status === 'approved')
  const shown = currentDiscountRequest(view.requests)
  const open = shown?.status === 'open' ? shown : undefined
  const declined = shown?.status === 'declined' ? shown : undefined
  if (!open && running.length === 0 && !declined && view.discounts.length === 0) return null
  const local = discountPercent(view.discounts, selected, view.max_percent)
  const canRequest = !!client.requestDiscounts && selected.length > 0 && terms && !!quote && !busy

  const request = async () => {
    setBusy(true)
    try {
      const v = await client.requestDiscounts!(organizationId, {
        ids: selected,
        message: message.trim() || undefined,
        accept_terms: terms,
      })
      setView(v)
      setSelected([])
      setTerms(false)
      setMessage('')
      notifySuccess(client, 'Discount requested', 'Qovery reviews it and confirms your new price.')
      onChanged?.()
    } catch (e) {
      setQuoteError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  const withdraw = async (r: DiscountRequest) => {
    setBusy(true)
    try {
      setView(await client.withdrawDiscountRequest!(organizationId, r.id))
      notifySuccess(client, 'Request withdrawn')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded border border-neutral bg-surface-neutral">
      <div className="p-5">
        <h3 className="text-base font-medium text-neutral">Discounts</h3>
        <p className="mt-1 text-sm text-neutral-subtle">
          Lower your price in exchange for something that helps us grow: your logo, your story, a longer commitment.
          Qovery reviews each request and confirms the new price.
        </p>
      </div>

      {(open || running.length > 0 || declined) && (
        <div className="flex flex-col gap-3 border-t border-neutral px-5 py-4">
          {running.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-neutral">
                <Icon iconName="circle-check" iconStyle="regular" className="mr-2 text-positive" />
                {r.labels.join(', ')}
              </span>
              <span className="flex items-center gap-2">
                <Badge color="green" variant="surface" size="sm">
                  {pct(r.percent)} off{r.discount_until ? ` until ${date(r.discount_until)}` : ''}
                </Badge>
                {!r.applied && (
                  <span className="text-xs text-neutral-subtle">Approved: being applied to your subscription</span>
                )}
              </span>
            </div>
          ))}
          {open && (
            <Callout.Root color="sky">
              <Callout.Icon>
                <Icon iconName="hourglass-half" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Your request is being reviewed</Callout.TextHeading>
                {open.labels.join(', ')}: {pct(open.percent)} off, {money(open.price_after, open.currency)} per {per}{' '}
                instead of {money(open.price_before, open.currency)}. Asked by {open.requested_by} on{' '}
                {date(open.requested_at)}.
                {client.withdrawDiscountRequest && (
                  <div className="mt-2">
                    <Button size="sm" variant="outline" color="neutral" loading={busy} onClick={() => withdraw(open)}>
                      Withdraw request
                    </Button>
                  </div>
                )}
              </Callout.Text>
            </Callout.Root>
          )}
          {declined && (
            <Callout.Root color="neutral">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Your request for {declined.labels.join(', ')} was declined</Callout.TextHeading>
                {declined.decline_reason}
              </Callout.Text>
            </Callout.Root>
          )}
        </div>
      )}

      {view.discounts.length > 0 && (
        <>
          <div className="divide-y divide-neutral border-t border-neutral">
            {view.discounts.map((d) => {
              const on = selected.includes(d.id)
              const can = on || discountSelectable(d, selected, view.granted)
              const id = `discount-${d.id}`
              return (
                <label
                  key={d.id}
                  htmlFor={id}
                  className={`flex items-start gap-3 px-5 py-3 ${can ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <Checkbox
                    id={id}
                    className="mt-0.5"
                    checked={on}
                    disabled={!can}
                    onCheckedChange={() => setSelected((s) => toggleDiscount(view.discounts, s, d.id, view.granted))}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`text-sm font-medium ${can ? 'text-neutral' : 'text-neutral-subtle'}`}>
                      {d.label}
                    </span>
                    <span className="text-xs text-neutral-subtle">
                      {!can && d.requires_label ? d.requires_label : d.gives}
                    </span>
                  </span>
                  <span
                    className={`whitespace-nowrap text-sm font-medium ${can ? 'text-positive' : 'text-neutral-subtle'}`}
                  >
                    −{pct(d.percent)}
                  </span>
                </label>
              )
            })}
          </div>
          <div className="flex flex-col gap-4 border-t border-neutral px-5 py-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="text-sm">
                <div className="text-xs text-neutral-subtle">Your price</div>
                {quote ? (
                  <div className="text-neutral">
                    <span className="mr-2 text-neutral-subtle line-through">{money(quote.price_before, cur)}</span>
                    <span className="text-lg font-medium">{money(quote.price_after, cur)}</span>{' '}
                    <span className="text-xs text-neutral-subtle">/ {per}</span>
                  </div>
                ) : (
                  <div className="text-neutral">
                    <span className="text-lg font-medium">{money(view.price, cur)}</span>{' '}
                    <span className="text-xs text-neutral-subtle">/ {per}</span>
                  </div>
                )}
              </div>
              {selected.length > 0 && (
                <div className="text-right text-sm">
                  <div className="text-xs text-neutral-subtle">Total discount</div>
                  <div className="font-medium text-positive">
                    −{pct(quote?.percent ?? local.percent)}
                    {quote && (
                      <span className="ml-1 text-xs font-normal text-neutral-subtle">
                        ({money(quote.saving, cur)} per {per})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {(quote?.capped ?? local.capped) && (
              <p className="text-xs text-neutral-subtle">
                Discounts add up to {pct(quote?.points ?? local.points)}; the most we offer is {pct(view.max_percent)}.
              </p>
            )}
            {quote && (
              <p className="text-xs text-neutral-subtle">
                On your plan and add-ons, not on usage beyond the plan, until {date(quote.discount_until)}
                {quote.term_months ? `, with a ${quote.term_months / 12}-year commitment` : ''}.
              </p>
            )}
            {quoteError && <p className="text-sm text-negative">{quoteError}</p>}
            {selected.length > 0 && (
              <>
                <InputTextArea
                  name="discount_message"
                  label="Message for Qovery (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                />
                <label htmlFor="discount-terms" className="flex cursor-pointer items-start gap-3 text-sm text-neutral">
                  <Checkbox
                    id="discount-terms"
                    className="mt-0.5"
                    checked={terms}
                    onCheckedChange={(v) => setTerms(v === true)}
                  />
                  <span>
                    I agree to give what each discount asks for. The discount can be withdrawn if it is not delivered.
                  </span>
                </label>
              </>
            )}
            <div className="flex justify-end">
              <Button size="md" disabled={!canRequest} loading={busy} onClick={request}>
                Request discount
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

/*
 * Discounts in exchange for counterparts, on the usage page (billing roles). Collapsed by
 * default: the title, one line on what it is, "See available discounts" and how much it can
 * save. Opened, it lists the discounts this organization may ask for, each with what it asks in
 * return and its percentage, picked with checkboxes that follow the rules (two and three years
 * exclude each other; paying the contract up front needs one), the price with the selection
 * priced by pricing-api, the terms to accept, and "Request discount". Qovery reviews each
 * request: the card then shows it first, under review (with Withdraw), approved (and until when)
 * or declined (with the reason), and stays open. Discounts already in the contract (negotiated
 * with Qovery) show ticked and locked, "Included in your contract": never asked for again, and
 * their points count toward the maximum. AWS Marketplace accounts get one line instead: their
 * price comes from their private offer.
 */
import type { BillingUsage, DiscountQuote, DiscountRequest, Discounts } from 'qovery-pricing-typescript-axios'
import { useEffect, useId, useState } from 'react'
import { BillingError, type PricingClient } from '@qovery/shared/billing/data-access'
import { Badge, Button, Callout, Checkbox, Icon, InputTextArea } from '@qovery/shared/ui'
import { date, money } from './format'
import { errorText, notifySuccess } from './parts'
import {
  currentDiscountRequest,
  discountPercent,
  discountRoom,
  discountSelectable,
  discountsExpanded,
  discountsUpTo,
  requestableDiscounts,
  toggleDiscount,
} from './rules'

const pct = (p: number) => `${Number.isInteger(p) ? p : p.toFixed(1)}%`
const AWS_PRIVATE_OFFER = 'Your price comes from your AWS private offer. Ask us for a new offer.'

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
  const [quoted, setQuoted] = useState<{ organizationId: string; selection: string[]; quote: DiscountQuote }>()
  const quote = quoted?.organizationId === organizationId && quoted.selection === selected ? quoted.quote : undefined
  const [quoteError, setQuoteError] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [terms, setTerms] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [opened, setOpened] = useState<boolean>()
  const listId = useId()
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
    setQuoteError('')
    if (!client.quoteDiscounts || selected.length === 0) return
    let live = true
    client
      .quoteDiscounts(organizationId, selected)
      .then((q) => {
        if (live) {
          setQuoted({ organizationId, selection: selected, quote: q })
          setQuoteError('')
        }
      })
      .catch((e) => {
        if (live) {
          setQuoted(undefined)
          setQuoteError(errorText(e))
        }
      })
    return () => {
      live = false
    }
  }, [client, organizationId, selected])

  if (!billing) return null
  if (error)
    return (
      <Callout.Root color="red">
        <Callout.Text>{error}</Callout.Text>
      </Callout.Root>
    )
  if (view?.availability.code === 'AWS_PRIVATE_OFFER') {
    return (
      <p className="rounded border border-neutral bg-surface-neutral px-5 py-4 text-sm text-neutral-subtle">
        {view.availability.detail || AWS_PRIVATE_OFFER}
      </p>
    )
  }
  if (!view || !view.availability.available) return null
  const cur = view.currency
  const per = view.period === 'year' ? 'year' : 'month'
  const running = view.requests.filter((r) => r.status === 'approved')
  const shown = currentDiscountRequest(view.requests)
  const open = shown?.status === 'open' ? shown : undefined
  const declined = shown?.status === 'declined' ? shown : undefined
  const contract = view.in_contract ?? []
  const contractPoints = view.contract_points ?? 0
  // What a request can still take off, and what meets a requirement: the contract counts for both.
  const room = discountRoom(view.max_percent, contractPoints)
  const have = [...view.granted, ...contract.map((d) => d.id)]
  if (!open && running.length === 0 && !declined && view.discounts.length === 0 && contract.length === 0) return null
  const local = discountPercent(view.discounts, selected, room)
  const canRequest = !!client.requestDiscounts && selected.length > 0 && terms && !!quote && !busy
  const expanded = discountsExpanded({ opened, selected, requests: view.requests })
  const upTo = discountsUpTo(view.discounts, room, have)

  const request = async () => {
    setBusy(true)
    try {
      const v = await client.requestDiscounts!(organizationId, {
        ids: requestableDiscounts(selected, contract),
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
    setWithdrawError('')
    setBusy(true)
    try {
      setView(await client.withdrawDiscountRequest!(organizationId, r.id))
      notifySuccess(client, 'Request withdrawn')
    } catch (e) {
      setWithdrawError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded border border-neutral bg-surface-neutral">
      <div className="p-5">
        <h3 className="text-base font-medium text-neutral">Discounts</h3>
        <p className="mt-1 text-sm text-neutral-subtle">
          Pay less in exchange for your logo, your story or a longer commitment. Qovery reviews each request and
          confirms your new price.
        </p>
        {view.discounts.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              size="md"
              variant="outline"
              color="neutral"
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => setOpened(!expanded)}
            >
              <Icon iconName={expanded ? 'chevron-up' : 'chevron-down'} iconStyle="regular" />
              {expanded ? 'Hide discounts' : 'See available discounts'}
            </Button>
            {!expanded && upTo > 0 && <span className="text-sm text-neutral-subtle">Up to {pct(upTo)} off</span>}
          </div>
        )}
      </div>

      {contract.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-neutral px-5 py-4">
          <div className="text-sm text-neutral-subtle">Included in your contract</div>
          {contract.map((d) => (
            <div key={d.id} className="flex items-start gap-3">
              <Checkbox
                id={`discount-contract-${d.id}`}
                className="mt-0.5"
                checked
                disabled
                aria-label={`${d.label}: included in your contract`}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-neutral">{d.label}</span>
                <span className="text-sm text-neutral-subtle">{d.gives}</span>
              </span>
              <Badge className="font-medium" color="neutral" variant="surface" size="sm">
                Included · −{pct(d.percent)}
              </Badge>
            </div>
          ))}
          <p className="text-sm text-neutral-subtle">
            Already in your price.{' '}
            {room > 0
              ? `${pct(contractPoints)} of the ${pct(view.max_percent)} maximum is used, so you can ask for up to ${pct(room)} more.`
              : `Your contract already includes the ${pct(view.max_percent)} maximum.`}
          </p>
        </div>
      )}

      {(open || running.length > 0 || declined) && (
        <div className="flex flex-col gap-3 border-t border-neutral px-5 py-4">
          {running.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-neutral">
                <Icon iconName="circle-check" iconStyle="regular" className="mr-2 text-positive" />
                {r.labels.join(', ')}
              </span>
              <span className="flex items-center gap-2">
                <Badge className="font-medium" color="green" variant="surface" size="sm">
                  {pct(r.percent)} off{r.discount_until ? ` until ${date(r.discount_until)}` : ''}
                </Badge>
                {!r.applied && (
                  <span className="text-sm text-neutral-subtle">Approved. We're applying it to your subscription.</span>
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
                <Callout.TextHeading>Qovery is reviewing your request.</Callout.TextHeading>
                {open.labels.join(', ')}: {pct(open.percent)} off, {money(open.price_after, open.currency)} per {per}{' '}
                instead of {money(open.price_before, open.currency)}. Asked by {open.requested_by} on{' '}
                {date(open.requested_at)}.
                {withdrawError && (
                  <p className="mt-2 text-negative" role="alert">
                    {withdrawError}
                  </p>
                )}
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
        <div id={listId} hidden={!expanded}>
          <div className="divide-y divide-neutral border-t border-neutral">
            {view.discounts.map((d) => {
              const on = selected.includes(d.id)
              const can = on || discountSelectable(d, selected, have, view.discounts)
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
                    onCheckedChange={() => setSelected((s) => toggleDiscount(view.discounts, s, d.id, have))}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`text-sm font-medium ${can ? 'text-neutral' : 'text-neutral-subtle'}`}>
                      {d.label}
                    </span>
                    <span className="text-sm text-neutral-subtle">
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
                <div className="text-sm text-neutral-subtle">Your price</div>
                {quote ? (
                  <div className="text-neutral">
                    <span className="mr-2 text-neutral-subtle line-through">{money(quote.price_before, cur)}</span>
                    <span className="text-lg font-medium">{money(quote.price_after, cur)}</span>{' '}
                    <span className="text-sm text-neutral-subtle">/ {per}</span>
                  </div>
                ) : (
                  <div className="text-neutral">
                    <span className="text-lg font-medium">{money(view.price, cur)}</span>{' '}
                    <span className="text-sm text-neutral-subtle">/ {per}</span>
                  </div>
                )}
              </div>
              {selected.length > 0 && (
                <div className="text-right text-sm">
                  <div className="text-sm text-neutral-subtle">Total discount</div>
                  <div className="font-medium text-positive">
                    −{pct(quote?.percent ?? local.percent)}
                    {quote && (
                      <span className="ml-1 text-sm font-normal text-neutral-subtle">
                        ({money(quote.saving, cur)} per {per})
                      </span>
                    )}
                  </div>
                  {contractPoints > 0 && (
                    <div className="text-sm text-neutral-subtle">
                      On top of the {pct(contractPoints)} in your contract
                    </div>
                  )}
                </div>
              )}
            </div>
            {(quote?.capped ?? local.capped) && (
              <p className="text-sm text-neutral-subtle">
                Discounts add up to {pct(quote?.points ?? local.points)}; the most we offer is {pct(view.max_percent)}
                {contractPoints > 0 ? `, ${pct(contractPoints)} of it already in your contract` : ''}.
              </p>
            )}
            {quote && (
              <p className="text-sm text-neutral-subtle">
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
                    I agree to deliver what each discount asks for. Qovery can withdraw a discount that isn't delivered.
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
        </div>
      )}
    </section>
  )
}

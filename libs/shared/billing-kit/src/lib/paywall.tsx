/*
 * Paywalls: when the plan does not include a feature, show what it does, then the ways to get it,
 * ranked by pricing-api for this customer and person (GET /organization/{id}/gates, or the
 * paywall core passes through in its 402).
 *
 *   const pw = usePaywall(client, organizationId, { actions: ['cluster.create'] })
 *   {pw.locked('cluster.create') && <PaywallLock gate={pw.gate('cluster.create')} onClick={() => pw.open('cluster.create')} />}
 *   {pw.element}
 *
 * <Paywall> is the dialog: the promotion (headline, benefits, image or video), then the options
 * (start a free trial, upgrade, add an add-on, ask an admin, talk to us), each with its confirm
 * step. <PaywallLock> is the small inline variant for a button or a menu entry.
 */
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Callout, Checkbox, Icon, InputTextArea, Modal } from '@qovery/shared/ui'
import { BillingError, type PricingClient } from './client'
import { date } from './format'
import { openPaymentMethodPage } from './invoices-page'
import { errorText, notifySuccess } from './parts'
import { Fact, PlanChangeFlow } from './plan-change'
import {
  continueChoices,
  gateFor,
  isLocked,
  lockLabel,
  newIdempotencyKey,
  optionPrice,
  trialEnds,
  trialRequest,
} from './rules'
import type { BillingUsage, Gate, PaywallInfo as PaywallData, PaywallOption, PaywallOptionType } from './types'

type Done = 'trial' | 'upgrade' | 'addon' | 'request'

export interface PaywallProps {
  organizationId: string
  client: PricingClient
  /** The gate (from usePaywall or client.gates), or a paywall from core's 402 body. */
  gate?: Gate
  paywall?: PaywallData
  /** Read the gate for this person when only a 402 paywall (ranked for billing roles) is known. */
  action?: string
  onClose: () => void
  /** After a trial started, a plan changed, an add-on was bought or a request was sent. */
  onDone?: (what: Done) => void
  onContactSales?: () => void
  /** "Update payment method": the console's billing page. Default: Chargebee's card page. */
  onUpdatePayment?: () => void
  /** Drawn in place, without the modal (the back office's previews). */
  inline?: boolean
}

type Step = 'choose' | 'trial' | 'addon' | 'ask' | 'upgrade' | 'done'

/** The paywall dialog: the feature's promotion, then the ways to get it. */
export function Paywall({
  organizationId,
  client,
  gate,
  paywall,
  action,
  onClose,
  onDone,
  onContactSales,
  onUpdatePayment,
  inline,
}: PaywallProps) {
  const [fresh, setFresh] = useState<Gate>()
  const p = fresh?.paywall ?? gate?.paywall ?? paywall
  const sku = p?.sku ?? gate?.sku ?? ''
  const [step, setStep] = useState<Step>('choose')
  const [picked, setPicked] = useState<PaywallOption>()
  const [done, setDone] = useState<{ title: string; body: string }>()
  const acted = useRef(false)

  // A paywall from a 402 was ranked for a billing role: read this person's own (a member asks).
  useEffect(() => {
    if (gate || !client.gates || (!action && !paywall?.sku)) return
    let live = true
    client
      .gates(organizationId, action ? { actions: [action] } : { skus: [paywall!.sku] })
      .then((r) => {
        const g = gateFor(r.gates, action ?? paywall!.sku)
        if (live && g) setFresh(g)
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [client, organizationId, action, paywall?.sku, gate]) // eslint-disable-line react-hooks/exhaustive-deps

  const event = useCallback(
    (ev: 'shown' | 'clicked' | 'dismissed', choice?: PaywallOptionType) => {
      if (sku && client.gateEvent && client.mode !== 'preview')
        client.gateEvent(organizationId, { sku, event: ev, choice }).catch(() => undefined)
    },
    [client, organizationId, sku]
  )
  useEffect(() => {
    if (sku) event('shown')
  }, [sku]) // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    if (!acted.current) event('dismissed')
    onClose()
  }
  const finish = (what: Done, title: string, body: string) => {
    acted.current = true
    setDone({ title, body })
    setStep('done')
    onDone?.(what)
  }
  const choose = (o: PaywallOption) => {
    acted.current = true
    event('clicked', o.type)
    setPicked(o)
    switch (o.type) {
      case 'start_trial':
        return setStep('trial')
      case 'addon':
        return setStep('addon')
      case 'request_admin':
        return setStep('ask')
      case 'upgrade':
        return setStep('upgrade')
      case 'contact_sales':
        onContactSales?.()
        return onClose()
      case 'update_payment':
        if (onUpdatePayment) onUpdatePayment()
        else openPaymentMethodPage(client, organizationId).catch(() => undefined)
        return onClose()
    }
  }

  if (!p) return null
  if (step === 'upgrade' && picked) {
    return (
      <UpgradeStep
        organizationId={organizationId}
        client={client}
        plan={picked.plan}
        onClose={close}
        onBack={() => setStep('choose')}
        onContactSales={onContactSales}
        onDone={() => {
          acted.current = true
          onDone?.('upgrade')
          onClose()
        }}
      />
    )
  }
  const body = (
    <div className="flex max-h-[85vh] flex-col">
      <div className="flex items-start gap-3 border-b border-neutral px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge color="brand" variant="surface" size="sm">
              <Icon iconName="lock" iconStyle="regular" className="mr-1 text-xs" />
              {p.title}
            </Badge>
            {client.mode === 'preview' && (
              <Badge color="yellow" variant="surface" size="sm">
                Preview
              </Badge>
            )}
          </div>
          <h2 className="h4 text-neutral">
            {step === 'done'
              ? done?.title
              : step === 'trial'
                ? 'Start your free trial'
                : step === 'addon'
                  ? `Add ${picked?.addon_name ?? 'it'}`
                  : step === 'ask'
                    ? 'Ask an admin'
                    : p.headline}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-subtle hover:bg-surface-neutral-componentHover"
        >
          <Icon iconName="xmark" iconStyle="solid" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        {step === 'choose' && <Promotion p={p} />}
        {step === 'choose' && <Options p={p} onChoose={choose} />}
        {step === 'trial' && picked && (
          <TrialStep
            organizationId={organizationId}
            client={client}
            sku={sku}
            option={picked}
            p={p}
            onBack={() => setStep('choose')}
            onStarted={(until, cont) =>
              finish(
                'trial',
                'Your trial has started',
                `${picked.includes ?? p.title} until ${date(until)}. ${cont ? `It then continues on ${cont}, as you chose. We email you 3 days before.` : 'We email you 3 days before it ends. Nothing is charged.'}`
              )
            }
          />
        )}
        {step === 'addon' && picked && (
          <AddonStep
            organizationId={organizationId}
            client={client}
            option={picked}
            onBack={() => setStep('choose')}
            onContactSales={onContactSales}
            onBought={() =>
              finish(
                'addon',
                `${picked.addon_name ?? 'The add-on'} is added`,
                'You can use it now. It shows on your next invoice, prorated.'
              )
            }
          />
        )}
        {step === 'ask' && (
          <AskStep
            organizationId={organizationId}
            client={client}
            sku={sku}
            option={picked}
            title={p.title}
            onBack={() => setStep('choose')}
            onSent={(existing) =>
              finish(
                'request',
                'Request sent',
                existing
                  ? 'You already asked: your request is still open. We email you when it is handled.'
                  : 'Your Owners, Admins and Billing Managers got an email with your request. We email you when it is handled.'
              )
            }
          />
        )}
        {step === 'done' && done && (
          <>
            <Callout.Root color="green">
              <Callout.Icon>
                <Icon iconName="circle-check" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>{done.body}</Callout.Text>
            </Callout.Root>
            <div className="flex justify-end">
              <Button size="lg" onClick={onClose}>
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
  if (inline)
    return <div className="w-full max-w-[600px] rounded-lg border border-neutral bg-background shadow-lg">{body}</div>
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) close()
      }}
      width="min(600px, calc(100vw - 24px))"
      buttonClose={false}
    >
      {body}
    </Modal>
  )
}

/** What the feature does: a taste of what is behind the lock. */
function Promotion({ p }: { p: PaywallData }) {
  return (
    <div className="flex flex-col gap-3">
      {p.media &&
        (p.media.kind === 'video' ? (
          <video
            src={p.media.url}
            className="w-full rounded border border-neutral"
            autoPlay
            muted
            loop
            playsInline
            aria-label={p.title}
          />
        ) : (
          <img src={p.media.url} alt={p.title} className="w-full rounded border border-neutral" />
        ))}
      {p.benefits.length > 0 && (
        <ul className="flex flex-col gap-2">
          {p.benefits.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-neutral">
              <Icon iconName="check" iconStyle="solid" className="mt-0.5 text-positive" />
              {b}
            </li>
          ))}
        </ul>
      )}
      {p.message && <p className="text-xs text-neutral-subtle">{p.message}</p>}
    </div>
  )
}

function Options({ p, onChoose }: { p: PaywallData; onChoose: (o: PaywallOption) => void }) {
  return (
    <div className="flex flex-col gap-2 border-t border-neutral pt-4">
      {p.options.map((o, i) => (
        <div
          key={o.type + (o.plan ?? o.addon ?? '')}
          className={`flex flex-wrap items-center gap-3 rounded border p-3 ${i === 0 ? 'border-brand-strong bg-surface-brand-subtle' : 'border-neutral'}`}
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-neutral">{o.label}</div>
            {(optionPrice(o) || o.detail) && (
              <div className="text-xs text-neutral-subtle">
                {o.type === 'upgrade' || o.type === 'addon' ? optionPrice(o) || o.detail : o.detail}
              </div>
            )}
          </div>
          <Button
            size="md"
            variant={i === 0 ? 'solid' : 'outline'}
            color={i === 0 ? 'brand' : 'neutral'}
            onClick={() => onChoose(o)}
          >
            {CTA[o.type]}
          </Button>
        </div>
      ))}
    </div>
  )
}

const CTA: Record<PaywallOptionType, string> = {
  start_trial: 'Start free trial',
  upgrade: 'See the plan',
  addon: 'Add it',
  request_admin: 'Ask an admin',
  contact_sales: 'Talk to us',
  update_payment: 'Update payment method',
}

function TrialStep({
  organizationId,
  client,
  sku,
  option,
  p,
  onBack,
  onStarted,
}: {
  organizationId: string
  client: PricingClient
  sku: string
  option: PaywallOption
  p: PaywallData
  onBack: () => void
  onStarted: (until: string, continues?: string) => void
}) {
  const choices = continueChoices(p)
  // Continuing automatically needs a card on file and an account the console can change.
  const [card, setCard] = useState<boolean | null>(null)
  useEffect(() => {
    if (!choices.length || !client.planOptions) return
    client
      .planOptions(organizationId)
      .then((o) => setCard(o.payment_method_on_file === true && o.change?.available === true))
      .catch(() => setCard(false))
  }, [client, organizationId]) // eslint-disable-line react-hooks/exhaustive-deps
  const [cont, setCont] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const target = choices[0]
  const ends = trialEnds(option.days ?? 14)
  async function start() {
    if (!client.startTrial) return
    setBusy(true)
    setError('')
    try {
      const r = await client.startTrial(organizationId, trialRequest(sku, target, cont))
      notifySuccess(client, 'Trial started', `${option.includes ?? p.title} until ${date(r.trial.ends_at)}.`)
      onStarted(
        r.trial.ends_at,
        cont && target ? `${target.plan_name ?? target.addon_name}, ${optionPrice(target)}` : undefined
      )
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }
  return (
    <div className="flex flex-col gap-4">
      {client.mode === 'preview' && (
        <Callout.Root color="sky">
          <Callout.Text>Preview: nothing is started.</Callout.Text>
        </Callout.Root>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Fact label="You get" hint="Free, no card needed">
          {option.includes ?? p.title}
        </Fact>
        <Fact label="Until" hint={`${option.days ?? 14} days from today`}>
          {date(ends)}
        </Fact>
      </div>
      {option.end_behaviour && <p className="text-sm text-neutral-subtle">{option.end_behaviour}</p>}
      {target && card && (
        <label
          htmlFor="paywall-continue"
          className="flex cursor-pointer items-start gap-3 rounded border border-neutral p-3"
        >
          <Checkbox
            id="paywall-continue"
            className="mt-0.5"
            checked={cont}
            onCheckedChange={(v) => setCont(v === true)}
          />
          <span className="text-sm text-neutral">
            Continue on {target.plan_name ?? target.addon_name} automatically when the trial ends ({optionPrice(target)}
            )
            {cont && (
              <span className="mt-1 block text-xs text-neutral-subtle">
                Your card on file is charged from {date(ends)}. We email you 3 days before, and you can turn this off in
                Billing until then.
              </span>
            )}
          </span>
        </label>
      )}
      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <Button size="lg" variant="plain" color="neutral" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button size="lg" loading={busy} onClick={start}>
          Start free trial
        </Button>
      </div>
    </div>
  )
}

function AddonStep({
  organizationId,
  client,
  option,
  onBack,
  onBought,
  onContactSales,
}: {
  organizationId: string
  client: PricingClient
  option: PaywallOption
  onBack: () => void
  onBought: () => void
  onContactSales?: () => void
}) {
  const [blocked, setBlocked] = useState<string>()
  const [key, setKey] = useState(newIdempotencyKey)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [needCard, setNeedCard] = useState(false)
  useEffect(() => {
    if (!option.addon || !client.quoteAddon) return
    client
      .quoteAddon(organizationId, { code: option.addon })
      .then((r) =>
        setBlocked(
          r.buy && !r.buy.available ? r.buy.detail ?? 'This add-on cannot be bought from the console.' : undefined
        )
      )
      .catch((e) => setError(errorText(e)))
  }, [client, organizationId, option.addon])
  async function buy() {
    if (!option.addon || !client.buyAddon) return
    setBusy(true)
    setError('')
    try {
      await client.buyAddon(organizationId, { code: option.addon }, key)
      notifySuccess(client, `${option.addon_name} added`, optionPrice(option))
      onBought()
    } catch (e) {
      setKey(newIdempotencyKey())
      if (e instanceof BillingError && e.code === 'PAYMENT_METHOD_REQUIRED') setNeedCard(true)
      setError(errorText(e))
    }
    setBusy(false)
  }
  return (
    <div className="flex flex-col gap-4">
      {client.mode === 'preview' && (
        <Callout.Root color="sky">
          <Callout.Text>Preview: nothing is charged.</Callout.Text>
        </Callout.Root>
      )}
      <Fact label={option.addon_name ?? 'Add-on'} hint="On top of your plan, prorated today, removable any time">
        {optionPrice(option)}
      </Fact>
      {blocked && (
        <Callout.Root color="neutral">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>{blocked}</Callout.Text>
        </Callout.Root>
      )}
      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      {needCard && (
        <Button
          size="md"
          variant="outline"
          color="neutral"
          onClick={() => openPaymentMethodPage(client, organizationId).catch((e) => setError(errorText(e)))}
        >
          <Icon iconName="credit-card" iconStyle="regular" />
          Add a payment method
        </Button>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <Button size="lg" variant="plain" color="neutral" onClick={onBack} disabled={busy}>
          Back
        </Button>
        {blocked && onContactSales && client.mode !== 'preview' ? (
          <Button size="lg" onClick={onContactSales}>
            Talk to us
          </Button>
        ) : (
          <Button size="lg" loading={busy} disabled={!!blocked && client.mode !== 'preview'} onClick={buy}>
            {option.amount != null ? `Add for ${optionPrice(option)}` : 'Add it'}
          </Button>
        )}
      </div>
    </div>
  )
}

function AskStep({
  organizationId,
  client,
  sku,
  option,
  title,
  onBack,
  onSent,
}: {
  organizationId: string
  client: PricingClient
  sku: string
  option?: PaywallOption
  title: string
  onBack: () => void
  onSent: (existing: boolean) => void
}) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function send() {
    if (!client.requestUpgrade) return
    setBusy(true)
    setError('')
    try {
      const r = await client.requestUpgrade(organizationId, { sku, message, source: 'paywall' })
      onSent(!!r.existing)
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-subtle">
        {option?.detail ?? 'Only Owners, Admins and Billing Managers can change the plan.'} They get an email asking for{' '}
        {title}.
      </p>
      <InputTextArea
        name="message"
        label="Message (optional)"
        value={message}
        onChange={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
      />
      {client.mode === 'preview' && (
        <Callout.Root color="sky">
          <Callout.Text>Preview: the request is simulated, no email is sent.</Callout.Text>
        </Callout.Root>
      )}
      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <Button size="lg" variant="plain" color="neutral" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button size="lg" loading={busy} onClick={send}>
          Send request
        </Button>
      </div>
    </div>
  )
}

/** The upgrade: the plan change journey with the paywall's plan selected. */
function UpgradeStep({
  organizationId,
  client,
  plan,
  onClose,
  onBack,
  onDone,
  onContactSales,
}: {
  organizationId: string
  client: PricingClient
  plan?: string
  onClose: () => void
  onBack: () => void
  onDone: () => void
  onContactSales?: () => void
}) {
  const [usage, setUsage] = useState<BillingUsage>()
  const [error, setError] = useState('')
  useEffect(() => {
    client
      .billingUsage(organizationId)
      .then(setUsage)
      .catch((e) => setError(errorText(e)))
  }, [client, organizationId])
  if (!client.planOptions || !client.quotePlanChange) {
    return (
      <Modal
        externalOpen
        setExternalOpen={(o) => {
          if (!o) onClose()
        }}
        width="min(520px, calc(100vw - 24px))"
        buttonClose={false}
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 className="h4 text-neutral">Change plan</h2>
          <p className="text-sm text-neutral-subtle">Plans are changed from the billing page.</p>
          <div className="flex justify-end gap-3">
            <Button size="lg" variant="plain" color="neutral" onClick={onBack}>
              Back
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
  if (error)
    return (
      <Modal
        externalOpen
        setExternalOpen={(o) => {
          if (!o) onClose()
        }}
        width="min(520px, calc(100vw - 24px))"
      >
        <div className="p-6">
          <Callout.Root color="red">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        </div>
      </Modal>
    )
  if (!usage) return null
  return (
    <PlanChangeFlow
      organizationId={organizationId}
      client={client}
      usage={usage}
      preselect={plan}
      onClose={onClose}
      onDone={onDone}
      onContactSales={onContactSales}
    />
  )
}

/** The small inline variant: a lock and the next step, on a button or a menu entry. */
export function PaywallLock({ gate, onClick, className }: { gate?: Gate; onClick?: () => void; className?: string }) {
  const label = lockLabel(gate)
  if (!label) return null
  const content = (
    <>
      <Icon iconName="lock" iconStyle="regular" className="text-xs" />
      {label}
    </>
  )
  const cls = `inline-flex items-center gap-1.5 rounded-full border border-brand-strong bg-surface-brand-subtle px-2 py-0.5 text-xs font-medium text-brand ${className ?? ''}`
  return onClick ? (
    <button
      type="button"
      className={cls}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
    >
      {content}
    </button>
  ) : (
    <span className={cls}>{content}</span>
  )
}

export interface UsePaywall {
  gates?: Gate[]
  gate: (key: string) => Gate | undefined
  locked: (key: string) => boolean
  /** Opens the paywall of an action or SKU, or of a paywall read from core's 402. */
  open: (key: string | { paywall: PaywallData; action?: string }) => void
  reload: () => void
  /** The dialog when one is open: place it once in the tree. */
  element: ReactNode
}

/**
 * Reads the gates of the actions and SKUs a page cares about, and renders the paywall on demand.
 * Without client.gates nothing is locked (the page works as before).
 */
export function usePaywall(
  client: PricingClient,
  organizationId: string,
  keys: { actions?: string[]; skus?: string[] },
  options: Omit<PaywallProps, 'organizationId' | 'client' | 'gate' | 'paywall' | 'action' | 'onClose'> & {
    onClose?: () => void
  } = {}
): UsePaywall {
  const [gates, setGates] = useState<Gate[]>()
  const [current, setCurrent] = useState<{ gate?: Gate; paywall?: PaywallData; action?: string }>()
  const sig = JSON.stringify(keys)
  const load = useCallback(() => {
    if (!client.gates || (!keys.actions?.length && !keys.skus?.length)) return
    client
      .gates(organizationId, keys)
      .then((r) => setGates(r.gates))
      .catch(() => setGates(undefined))
  }, [client, organizationId, sig]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(load, [load])
  const gate = useCallback((key: string) => gateFor(gates, key), [gates])
  const open = useCallback(
    (key: string | { paywall: PaywallData; action?: string }) => {
      if (typeof key === 'string') {
        const g = gateFor(gates, key)
        if (isLocked(g)) setCurrent({ gate: g })
        return
      }
      setCurrent({ paywall: key.paywall, action: key.action })
    },
    [gates]
  )
  const element = useMemo(
    () =>
      current ? (
        <Paywall
          organizationId={organizationId}
          client={client}
          gate={current.gate}
          paywall={current.paywall}
          action={current.action}
          {...options}
          onClose={() => {
            setCurrent(undefined)
            options.onClose?.()
          }}
          onDone={(what) => {
            load()
            options.onDone?.(what)
          }}
        />
      ) : null,
    [current, client, organizationId, load]
  ) // eslint-disable-line react-hooks/exhaustive-deps
  return { gates, gate, locked: (key) => isLocked(gateFor(gates, key)), open, reload: load, element }
}

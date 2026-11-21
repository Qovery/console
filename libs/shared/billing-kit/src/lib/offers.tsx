/*
 * Offers and upgrade requests in the console, from pricing-api's GET /organization/{id}/offers.
 *
 *   <OfferHost organizationId={id} client={client} onAction={…} />
 *
 * mounted once in the console's layout shows the sign-in popup (once per person and offer) and
 * the banners (until dismissed); billing roles also see their team's open upgrade requests.
 * <BillingPage> mounts it with variant="card". <AskAdminModal> is the member's side of a
 * request, <EmailPreferencesPanel> the person's email settings. Billing roles also see a plan
 * proposal from Qovery staff here (<ProposalBanner>), when the host passes onReviewProposal.
 */
import { useCallback, useEffect, useState } from 'react'
import { Badge, Banner, Button, Callout, Icon, InputTextArea, InputToggle, Modal } from '@qovery/shared/ui'
import type { PricingClient } from './client'
import { date } from './format'
import { ProposalHost } from './proposals'
import type { EmailPreferences, Offer, Offers, PlanProposal, Trial, UpgradeRequest } from './types'

const TONE: Record<string, string> = {
  brand: 'border-brand-strong bg-surface-brand-component',
  positive: 'border-positive-component bg-surface-positive-subtle',
  warning: 'border-warning-component bg-surface-warning-subtle',
  neutral: 'border-neutral bg-surface-neutral-subtle',
}
const BAR: Record<string, 'brand' | 'yellow' | 'purple'> = {
  brand: 'brand',
  positive: 'purple',
  warning: 'yellow',
  neutral: 'brand',
}

/** An offer as a banner: a card on the billing page, or the console's top bar. */
export function OfferBanner({
  offer,
  variant = 'card',
  onAction,
  onDismiss,
}: {
  offer: Offer
  variant?: 'card' | 'bar'
  onAction: (o: Offer) => void
  onDismiss?: (o: Offer) => void
}) {
  const c = offer.content
  if (variant === 'bar') {
    return (
      <Banner
        color={BAR[c.tone ?? 'brand']}
        buttonLabel={c.cta_label}
        onClickButton={() => onAction(offer)}
        dismissible={!!onDismiss}
        onDismiss={() => onDismiss?.(offer)}
      >
        {c.badge && <span className="mr-2 rounded bg-surface-neutral px-1.5 py-0.5 text-xs">{c.badge}</span>}
        {c.title}
      </Banner>
    )
  }
  return (
    <div
      className={`relative flex flex-wrap items-center gap-4 rounded border px-5 py-4 ${TONE[c.tone ?? 'brand'] ?? TONE.brand}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {c.badge && (
            <Badge color="brand" variant="surface" size="sm">
              {c.badge}
            </Badge>
          )}
          {offer.preview && (
            <Badge color="yellow" variant="surface" size="sm">
              Draft preview
            </Badge>
          )}
          <span className="text-sm font-medium text-neutral">{c.title}</span>
        </div>
        {c.body && <p className="mt-1 text-sm text-neutral-subtle">{c.body.split('\n\n')[0]}</p>}
        {offer.ends_at && <p className="mt-1 text-xs text-neutral-subtle">Until {date(offer.ends_at)}</p>}
      </div>
      <Button size="md" onClick={() => onAction(offer)}>
        {c.cta_label}
      </Button>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => onDismiss(offer)}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-neutral-subtle hover:bg-surface-neutral-componentHover"
        >
          <Icon iconName="xmark" iconStyle="solid" className="text-xs" />
        </button>
      )}
    </div>
  )
}

/** An offer as the sign-in popup. */
export function OfferModal({
  offer,
  onAction,
  onClose,
  inline,
}: {
  offer: Offer
  onAction: (o: Offer) => void
  onClose: () => void
  inline?: boolean
}) {
  const c = offer.content
  const body = (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {c.badge && (
            <Badge color="brand" variant="surface" size="sm">
              {c.badge}
            </Badge>
          )}
          {offer.preview && (
            <Badge color="yellow" variant="surface" size="sm">
              Draft preview
            </Badge>
          )}
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-subtle hover:bg-surface-neutral-componentHover"
        >
          <Icon iconName="xmark" iconStyle="solid" />
        </button>
      </div>
      <h2 className="h4 text-neutral">{c.title}</h2>
      {c.body
        .split('\n\n')
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="text-sm text-neutral-subtle">
            {p}
          </p>
        ))}
      {offer.ends_at && <p className="text-xs text-neutral-subtle">Offer valid until {date(offer.ends_at)}.</p>}
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button size="lg" variant="plain" color="neutral" onClick={onClose}>
          Not now
        </Button>
        <Button size="lg" onClick={() => onAction(offer)}>
          {c.cta_label}
        </Button>
      </div>
    </div>
  )
  // inline: the popup drawn in place (the back office's editor preview).
  if (inline)
    return <div className="w-full max-w-[520px] rounded-lg border border-neutral bg-background shadow-lg">{body}</div>
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) onClose()
      }}
      width="min(520px, calc(100vw - 24px))"
      buttonClose={false}
    >
      {body}
    </Modal>
  )
}

/** Billing roles: the team's open upgrade requests. */
export function RequestsBanner({
  requests,
  skuName,
  onReview,
  onDecline,
}: {
  requests: UpgradeRequest[]
  skuName: (sku: string) => string
  onReview: () => void
  onDecline?: (r: UpgradeRequest) => void
}) {
  if (!requests.length) return null
  return (
    <Callout.Root color="sky">
      <Callout.Icon>
        <Icon iconName="hand" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>
          {requests.length === 1
            ? 'A teammate asks for an upgrade'
            : `${requests.length} upgrade requests from your team`}
        </Callout.TextHeading>
        <div className="mt-1 flex flex-col gap-1">
          {requests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-x-3 text-sm">
              <span>
                <span className="font-medium">{r.email}</span> needs more {skuName(r.sku).toLowerCase() || 'resources'}
                {r.message ? `: "${r.message}"` : ''}
              </span>
              <span className="text-xs text-neutral-subtle">{date(r.created_at)}</span>
              {onDecline && (
                <button
                  type="button"
                  className="text-xs text-neutral-subtle hover:underline"
                  onClick={() => onDecline(r)}
                >
                  Decline
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button size="sm" onClick={onReview}>
            Review plans
          </Button>
        </div>
      </Callout.Text>
    </Callout.Root>
  )
}

/** A member at a limit asks the billing roles for more. */
export function AskAdminModal({
  organizationId,
  client,
  sku,
  skuName,
  onClose,
}: {
  organizationId: string
  client: PricingClient
  sku?: string
  skuName?: string
  onClose: () => void
}) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ existing?: boolean; notified: number }>()
  const [error, setError] = useState('')
  async function send() {
    if (!client.requestUpgrade) return
    setBusy(true)
    setError('')
    try {
      const r = await client.requestUpgrade(organizationId, { sku, message })
      setDone(r)
    } catch (e) {
      setError((e as Error).message)
    }
    setBusy(false)
  }
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
        <h2 className="h4 text-neutral">
          {done ? 'Request sent' : `Ask for more ${skuName?.toLowerCase() ?? ''}`.trim()}
        </h2>
        {done ? (
          <p className="text-sm text-neutral-subtle">
            {done.existing
              ? 'You already asked: your request is still open.'
              : "Your organization's Owners, Admins and Billing Managers got an email and see your request on the billing page."}{' '}
            We will email you when the plan changes.
          </p>
        ) : (
          <>
            <p className="text-sm text-neutral-subtle">
              Only Owners, Admins and Billing Managers can change the plan. They get an email with your request.
            </p>
            <InputTextArea
              name="message"
              label="Message (optional)"
              value={message}
              onChange={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
            />
          </>
        )}
        {client.mode === 'preview' && !done && (
          <Callout.Root color="sky">
            <Callout.Text>Preview: the request is simulated, no email is sent.</Callout.Text>
          </Callout.Root>
        )}
        {error && (
          <Callout.Root color="red">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <div className="flex justify-end gap-3">
          {done ? (
            <Button size="lg" onClick={onClose}>
              Close
            </Button>
          ) : (
            <>
              <Button size="lg" variant="plain" color="neutral" onClick={onClose}>
                Cancel
              </Button>
              <Button size="lg" loading={busy} onClick={send}>
                Send request
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

/** The person's email preferences for this organization (billing emails cannot be turned off). */
export function EmailPreferencesPanel({ organizationId, client }: { organizationId: string; client: PricingClient }) {
  const [p, setP] = useState<EmailPreferences>()
  const [error, setError] = useState('')
  useEffect(() => {
    client
      .emailPreferences?.(organizationId)
      .then(setP)
      .catch((e) => setError(e.message))
  }, [client, organizationId])
  if (!client.emailPreferences) return null
  if (error)
    return (
      <Callout.Root color="red">
        <Callout.Text>{error}</Callout.Text>
      </Callout.Root>
    )
  if (!p) return null
  return (
    <div className="rounded border border-neutral bg-surface-neutral">
      <div className="border-b border-neutral px-5 py-3">
        <h3 className="text-sm font-medium text-neutral">Email preferences</h3>
        <p className="text-xs text-neutral-subtle">
          Emails about this organization's plan and usage, sent to {p.email}.
        </p>
      </div>
      <div className="divide-y divide-neutral">
        {p.categories.map((c) => (
          <div key={c.category} className="px-5 py-3">
            <InputToggle
              small
              value={c.enabled}
              disabled={c.locked}
              title={c.name}
              description={c.locked ? `${c.description}` : c.description}
              onChange={(v) =>
                client
                  .setEmailPreference?.(organizationId, c.category, v)
                  .then(setP)
                  .catch((e) => setError(e.message))
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Loads the person's offers and requests, and records what they see and do. */
export function useOffers(organizationId: string, client: PricingClient) {
  const [data, setData] = useState<Offers>()
  const [hidden, setHidden] = useState<Set<number>>(new Set())
  const [modalDone, setModalDone] = useState<Set<number>>(new Set())
  const load = useCallback(() => {
    if (!client.offers) return
    client
      .offers(organizationId)
      .then(setData)
      .catch(() => setData(undefined))
  }, [client, organizationId])
  useEffect(load, [load])
  const event = (o: Offer, ev: 'shown' | 'clicked' | 'dismissed', surface: string) => {
    client.offerEvent?.(organizationId, o.id, ev, surface).catch(() => undefined)
  }
  const visible = (data?.offers ?? []).filter((o) => !hidden.has(o.id))
  const modal = visible.find((o) => o.surfaces.includes('modal') && !modalDone.has(o.id))
  const banners = visible.filter((o) => o.surfaces.includes('banner'))
  // Banners count as shown once per load.
  useEffect(() => {
    banners.forEach((o) => event(o, 'shown', 'banner'))
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (modal) event(modal, 'shown', 'modal')
  }, [modal?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  return {
    data,
    banners,
    modal,
    reload: load,
    dismiss: (o: Offer) => {
      event(o, 'dismissed', 'banner')
      setHidden(new Set([...hidden, o.id]))
    },
    closeModal: (o: Offer) => setModalDone(new Set([...modalDone, o.id])),
    clicked: (o: Offer, surface: string) => {
      event(o, 'clicked', surface)
      setModalDone(new Set([...modalDone, o.id]))
    },
  }
}

export interface OfferHostProps {
  organizationId: string
  client: PricingClient
  /** What the offer's button does in the host (open the upgrade flow on a plan, yearly billing…). */
  onAction: (o: Offer) => void
  /** card on a page, bar for the console's top banner. */
  variant?: 'card' | 'bar'
  /** Billing roles: open the plan picker from a request. */
  onReviewRequests?: () => void
  skuName?: (sku: string) => string
  /** Show the sign-in popup (default). Off where another host already shows it. */
  modal?: boolean
  /** Billing roles: a plan proposal from Qovery staff. Review opens the plan change on it (the
   * console's top bar can send people to the billing page instead). Without it, no proposal shows. */
  onReviewProposal?: (p: PlanProposal) => void
}

/** Banners, the sign-in popup and (billing roles) the team's upgrade requests. */
export function OfferHost({
  organizationId,
  client,
  onAction,
  variant = 'card',
  onReviewRequests,
  skuName = (s) => s,
  modal = true,
  onReviewProposal,
}: OfferHostProps) {
  const o = useOffers(organizationId, client)
  const [declined, setDeclined] = useState<Set<number>>(new Set())
  // Trial offers start the trial here, then tell the host (which can refresh the billing page).
  const [started, setStarted] = useState<{ offer: Offer; trial?: Trial; error?: string }>()
  const act = (x: Offer, surface: string) => {
    o.clicked(x, surface)
    if (x.content.action.type === 'trial' && client.acceptOffer) {
      client
        .acceptOffer(organizationId, x.id)
        .then((r) => {
          setStarted({ offer: x, trial: r.trial })
          o.reload()
          onAction(x)
        })
        .catch((e: Error) => setStarted({ offer: x, error: e.message }))
      return
    }
    onAction(x)
  }
  const billing = o.data?.user.access !== 'member'
  const requests = (o.data?.upgrade_requests ?? []).filter((r) => !declined.has(r.id))
  return (
    <>
      {billing && requests.length > 0 && onReviewRequests && (
        <RequestsBanner
          requests={requests}
          skuName={skuName}
          onReview={onReviewRequests}
          onDecline={
            client.closeUpgradeRequest
              ? (r) => {
                  client.closeUpgradeRequest?.(organizationId, r.id, 'declined').catch(() => undefined)
                  setDeclined(new Set([...declined, r.id]))
                }
              : undefined
          }
        />
      )}
      {!billing && requests.length > 0 && (
        <Callout.Root color="neutral">
          <Callout.Text>
            You asked for more {requests.map((r) => skuName(r.sku).toLowerCase()).join(', ')} on{' '}
            {date(requests[0].created_at)}. Your admins were told; we will email you when the plan changes.
          </Callout.Text>
        </Callout.Root>
      )}
      {started?.trial && (
        <Callout.Root color="green">
          <Callout.Text>
            <Callout.TextHeading>Your trial has started</Callout.TextHeading>
            {started.trial.value} until {date(started.trial.ends_at)}. We will remind you before it ends.
          </Callout.Text>
        </Callout.Root>
      )}
      {started?.error && (
        <Callout.Root color="yellow">
          <Callout.Text>
            <Callout.TextHeading>The trial could not start</Callout.TextHeading>
            {started.error}
          </Callout.Text>
        </Callout.Root>
      )}
      {onReviewProposal && (
        <ProposalHost organizationId={organizationId} client={client} onReview={onReviewProposal} variant={variant} />
      )}
      {o.banners.map((b) => (
        <OfferBanner key={b.id} offer={b} variant={variant} onAction={(x) => act(x, 'banner')} onDismiss={o.dismiss} />
      ))}
      {modal && o.modal && (
        <OfferModal offer={o.modal} onClose={() => o.closeModal(o.modal as Offer)} onAction={(x) => act(x, 'modal')} />
      )}
    </>
  )
}

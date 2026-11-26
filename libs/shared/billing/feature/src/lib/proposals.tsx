/*
 * Plan proposals in the console: a plan someone at Qovery suggests for this organization, from
 * pricing-api's GET /organization/{id}/proposals (billing roles only; members get nothing).
 *
 *   <ProposalBanner proposal={p} onReview={…} onSnooze={…} onDismiss={…} />
 *
 * Review opens the plan change review on the proposed plan and period, with the concession
 * (PlanChangeFlow's `proposal`); Remind me later hides it for 3 days, a week or two weeks (it
 * comes back with a reminder email); Dismiss closes it, with an optional reason. <OfferHost>
 * shows it where offers show (the billing page card, the console's top bar).
 */
import * as Dialog from '@radix-ui/react-dialog'
import type { ProposalDismissReason } from 'qovery-pricing-typescript-axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PlanProposal, PricingClient, Proposals } from '@qovery/shared/billing/data-access'
import { Banner, Button, Callout, Heading, Icon, InputTextArea, Modal, RadioGroup } from '@qovery/shared/ui'
import { date, money } from './format'
import { forgetReads, sharedRead } from './reads'
import { BAR_TEXT, barClass, proposalHeading, proposalLine, proposalShortLine, snoozeLabel } from './rules'

type ProposalListener = (proposalId: number) => void
const proposalListeners = new WeakMap<PricingClient, Map<string, Set<ProposalListener>>>()

export function hideProposal(client: PricingClient, organizationId: string, proposalId: number) {
  forgetReads(client, `proposals:${organizationId}`)
  proposalListeners
    .get(client)
    ?.get(organizationId)
    ?.forEach((listener) => listener(proposalId))
}

export function readProposal(client: PricingClient, organizationId: string, fresh = false) {
  const proposals = client.proposals
  if (!proposals) return Promise.resolve<Proposals>({ proposal: null })
  return sharedRead<Proposals>(
    client,
    `proposals:${organizationId}`,
    () => proposals.call(client, organizationId),
    fresh
  )
}

/** Loads the organization's proposal, records the first view, and snoozes or dismisses it. */
export function useProposal(organizationId: string, client: PricingClient, enabled = true) {
  const [proposal, setProposal] = useState<PlanProposal | null>()
  const [error, setError] = useState('')
  const viewed = useRef<number | undefined>(undefined)
  const request = useRef(0)
  const hidden = useRef<number | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  // The top bar and the billing page's card share one read (reads.ts); a reload reads again.
  const read = useCallback(
    (fresh: boolean) => {
      if (!enabled || !client.proposals) return
      const id = ++request.current
      readProposal(client, organizationId, fresh).then(
        (r) => {
          if (request.current === id) setProposal(r.proposal?.id === hidden.current ? null : r.proposal)
        },
        () => {
          if (request.current === id) setProposal(null)
        }
      )
    },
    [client, organizationId, enabled]
  )
  useEffect(() => {
    if (!enabled) return
    setProposal(undefined)
    hidden.current = undefined
    let groups = proposalListeners.get(client)
    if (!groups) proposalListeners.set(client, (groups = new Map()))
    let group = groups.get(organizationId)
    if (!group) groups.set(organizationId, (group = new Set()))
    const listener = (proposalId: number) => {
      hidden.current = proposalId
      setProposal((current) => (current?.id === proposalId ? null : current))
    }
    group.add(listener)
    read(false)
    return () => {
      request.current++
      group.delete(listener)
      if (group.size === 0) groups.delete(organizationId)
    }
  }, [client, enabled, organizationId, read])
  const load = useCallback(() => read(true), [read])
  useEffect(() => {
    if (!proposal || proposal.preview || viewed.current === proposal.id) return
    const recordView = client.viewProposal
    if (!recordView) return
    viewed.current = proposal.id
    sharedRead(client, `proposal-view:${organizationId}:${proposal.id}`, () =>
      recordView.call(client, organizationId, proposal.id)
    ).catch(() => undefined)
  }, [proposal, client, organizationId])
  return {
    proposal: proposal ?? null,
    error,
    busy,
    reload: load,
    /** Not answered yet (the top bar waits, so an offer does not flash before the proposal). */
    loading: enabled && !!client.proposals && proposal === undefined,
    snooze: async (days: number) => {
      if (!proposal || busy) return
      setError('')
      setBusy(true)
      try {
        await client.snoozeProposal?.(organizationId, proposal.id, days)
        hideProposal(client, organizationId, proposal.id)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setBusy(false)
      }
    },
    dismiss: async (reason?: ProposalDismissReason, note?: string) => {
      if (!proposal || busy) return
      setError('')
      setBusy(true)
      try {
        await client.dismissProposal?.(organizationId, proposal.id, {
          ...(reason ? { reason } : {}),
          ...(note ? { note } : {}),
        })
        hideProposal(client, organizationId, proposal.id)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setBusy(false)
      }
    },
  }
}

export interface ProposalBannerProps {
  proposal: PlanProposal
  /** card on the billing pages, bar for the console's top banner (Review only; the card has the rest). */
  variant?: 'card' | 'bar'
  onReview: (p: PlanProposal) => void
  onSnooze?: (days: number) => void
  onDismiss?: (reason?: ProposalDismissReason, note?: string) => void
  error?: string
  busy?: boolean
}

/** The proposal as a banner: who suggests what, the one line, the message, and the three choices. */
export function ProposalBanner({
  proposal: p,
  variant = 'card',
  onReview,
  onSnooze,
  onDismiss,
  error,
  busy = false,
}: ProposalBannerProps) {
  const [later, setLater] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  if (variant === 'bar') {
    const line = proposalLine(p)
    return (
      <Banner
        color="brand"
        buttonLabel="Review"
        onClickButton={() => onReview(p)}
        className={barClass(false)}
        title={line}
      >
        <span className={BAR_TEXT}>
          <span className="hidden sm:inline">{line}</span>
          <span className="sm:hidden">{proposalShortLine(p)}</span>
        </span>
      </Banner>
    )
  }
  return (
    <div className="rounded border border-brand-strong bg-surface-brand-component px-5 py-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-neutral">{proposalLine(p)}</div>
          {p.message && (
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-neutral-subtle">{p.message}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-subtle">
            {p.current.yearly != null && p.proposed.yearly != null && (
              <span>
                {p.current.plan_name} today about {money(p.current.yearly, p.currency)} a year, {p.plan.name} about{' '}
                {money(p.proposed.yearly, p.currency)} at the same usage
              </span>
            )}
            {p.concession && <span className="text-positive">{p.concession.label}</span>}
            <span>Open until {date(p.expires_at)}</span>
            {p.comparison_url && (
              <a
                href={p.comparison_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                View the full comparison
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="md" disabled={busy} onClick={() => onReview(p)}>
            Review
          </Button>
          {onSnooze && (
            <Button size="md" variant="outline" color="neutral" disabled={busy} onClick={() => setLater(!later)}>
              Remind me later
            </Button>
          )}
          {onDismiss && (
            <Button size="md" variant="plain" color="neutral" disabled={busy} onClick={() => setDismissing(true)}>
              Dismiss
            </Button>
          )}
        </div>
      </div>
      {later && onSnooze && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-subtle">
          <span>Show it again in</span>
          {p.snooze_days.map((d) => (
            <Button
              key={d}
              size="sm"
              variant="outline"
              color="neutral"
              disabled={busy}
              onClick={() => {
                setLater(false)
                onSnooze(d)
              }}
            >
              {snoozeLabel(d)}
            </Button>
          ))}
          <span className="text-xs">We will email you a reminder then.</span>
        </div>
      )}
      {error && !dismissing && (
        <div className="mt-3">
          <Callout.Root color="red">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        </div>
      )}
      {dismissing && onDismiss && (
        <DismissProposal
          proposal={p}
          onClose={() => setDismissing(false)}
          onDismiss={onDismiss}
          error={error}
          busy={busy}
        />
      )}
    </div>
  )
}

function DismissProposal({
  proposal: p,
  onClose,
  onDismiss,
  busy,
  error,
}: {
  proposal: PlanProposal
  busy: boolean
  error?: string
  onClose: () => void
  onDismiss: (reason?: ProposalDismissReason, note?: string) => void
}) {
  const [reason, setReason] = useState<ProposalDismissReason | ''>('')
  const [note, setNote] = useState('')
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o && !busy) onClose()
      }}
      width="min(480px, calc(100vw - 24px))"
      buttonClose={false}
    >
      <div className="flex flex-col gap-4 p-6">
        <Dialog.Title asChild>
          <Heading level={2}>Dismiss the suggestion</Heading>
        </Dialog.Title>
        <Dialog.Description className="text-sm text-neutral-subtle">
          {p.sender_name || 'The Qovery team'} will know you passed on {p.plan.name}. Telling them why is optional and
          helps them suggest something better.
        </Dialog.Description>
        <RadioGroup.Root
          aria-label="Reason for dismissing the suggestion"
          className="flex flex-col gap-2"
          value={reason}
          onValueChange={(v) => setReason(v as ProposalDismissReason)}
        >
          {p.dismiss_reasons.map((r) => (
            <label
              key={r.value}
              htmlFor={`dismiss-${r.value}`}
              className="flex cursor-pointer items-center gap-2 text-sm text-neutral"
            >
              <RadioGroup.Item id={`dismiss-${r.value}`} value={r.value} />
              {r.label}
            </label>
          ))}
        </RadioGroup.Root>
        <InputTextArea
          name="note"
          label="Anything to add (optional)"
          value={note}
          onChange={(e) => setNote((e.target as HTMLTextAreaElement).value.slice(0, 500))}
        />
        {error && (
          <Callout.Root color="red">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <div className="flex justify-end gap-3">
          <Button size="lg" variant="plain" color="neutral" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="lg"
            loading={busy}
            disabled={busy}
            onClick={() => onDismiss(reason || undefined, note.trim() || undefined)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/** The proposal banner where it belongs (billing roles; nothing otherwise): <UsagePage> mounts it as
 * a card, and <OfferHost onReviewProposal> in the top bar. */
export function ProposalHost({
  organizationId,
  client,
  onReview,
  variant = 'card',
}: {
  organizationId: string
  client: PricingClient
  onReview: (p: PlanProposal) => void
  variant?: 'card' | 'bar'
}) {
  const pr = useProposal(organizationId, client)
  if (!pr.proposal) return null
  if (variant === 'bar') return <ProposalBanner proposal={pr.proposal} variant="bar" onReview={onReview} />
  return (
    <ProposalBanner
      proposal={pr.proposal}
      onReview={onReview}
      error={pr.error}
      busy={pr.busy}
      onSnooze={client.snoozeProposal ? pr.snooze : undefined}
      onDismiss={client.dismissProposal ? pr.dismiss : undefined}
    />
  )
}

/** In the plan change review: who suggested it, their message, and the concession. */
export function ProposalNote({ proposal: p }: { proposal: PlanProposal }) {
  return (
    <Callout.Root color="purple">
      <Callout.Icon>
        <Icon iconName="envelope-open-text" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>{proposalHeading(p)}</Callout.TextHeading>
        {p.message && <div className="whitespace-pre-line">{p.message}</div>}
        <div className="mt-1 text-xs">Open until {date(p.expires_at)}.</div>
      </Callout.Text>
    </Callout.Root>
  )
}

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
import { useCallback, useEffect, useRef, useState } from 'react'
import { Banner, Button, Callout, Icon, InputTextArea, Modal, RadioGroup } from '@qovery/shared/ui'
import type { PricingClient } from './client'
import { date, money } from './format'
import { forgetReads, sharedRead } from './reads'
import { BAR_TEXT, barClass, proposalHeading, proposalLine, proposalShortLine, snoozeLabel } from './rules'
import type { PlanProposal, ProposalDismissReason, Proposals } from './types'

/** Loads the organization's proposal, records the first view, and snoozes or dismisses it. */
export function useProposal(organizationId: string, client: PricingClient, enabled = true) {
  const [proposal, setProposal] = useState<PlanProposal | null>()
  const [error, setError] = useState('')
  const viewed = useRef<number | undefined>(undefined)
  // The top bar and the billing page's card share one read (reads.ts); a reload reads again.
  const read = useCallback(
    (fresh: boolean) => {
      const proposals = client.proposals
      if (!enabled || !proposals) return
      sharedRead<Proposals>(client, `proposals:${organizationId}`, () => proposals.call(client, organizationId), fresh)
        .then((r) => setProposal(r.proposal))
        .catch(() => setProposal(null))
    },
    [client, organizationId, enabled]
  )
  useEffect(() => read(false), [read])
  const load = useCallback(() => read(true), [read])
  useEffect(() => {
    if (!proposal || proposal.preview || viewed.current === proposal.id) return
    viewed.current = proposal.id
    client.viewProposal?.(organizationId, proposal.id).catch(() => undefined)
  }, [proposal, client, organizationId])
  return {
    proposal: proposal ?? null,
    error,
    reload: load,
    /** Not answered yet (the top bar waits, so an offer does not flash before the proposal). */
    loading: enabled && !!client.proposals && proposal === undefined,
    snooze: async (days: number) => {
      if (!proposal) return
      setError('')
      try {
        await client.snoozeProposal?.(organizationId, proposal.id, days)
        forgetReads(client, `proposals:${organizationId}`)
        setProposal(null)
      } catch (e) {
        setError((e as Error).message)
      }
    },
    dismiss: async (reason?: ProposalDismissReason, note?: string) => {
      if (!proposal) return
      setError('')
      try {
        await client.dismissProposal?.(organizationId, proposal.id, {
          ...(reason ? { reason } : {}),
          ...(note ? { note } : {}),
        })
        forgetReads(client, `proposals:${organizationId}`)
        setProposal(null)
      } catch (e) {
        setError((e as Error).message)
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
}

/** The proposal as a banner: who suggests what, the one line, the message, and the three choices. */
export function ProposalBanner({
  proposal: p,
  variant = 'card',
  onReview,
  onSnooze,
  onDismiss,
  error,
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
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-subtle">
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
          <Button size="md" onClick={() => onReview(p)}>
            Review
          </Button>
          {onSnooze && (
            <Button size="md" variant="outline" color="neutral" onClick={() => setLater(!later)}>
              Remind me later
            </Button>
          )}
          {onDismiss && (
            <Button size="md" variant="plain" color="neutral" onClick={() => setDismissing(true)}>
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
      {error && (
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
          onDismiss={(r, n) => {
            setDismissing(false)
            onDismiss(r, n)
          }}
        />
      )}
    </div>
  )
}

function DismissProposal({
  proposal: p,
  onClose,
  onDismiss,
}: {
  proposal: PlanProposal
  onClose: () => void
  onDismiss: (reason?: ProposalDismissReason, note?: string) => void
}) {
  const [reason, setReason] = useState<ProposalDismissReason | ''>('')
  const [note, setNote] = useState('')
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) onClose()
      }}
      width="min(480px, calc(100vw - 24px))"
      buttonClose={false}
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 className="h4 text-neutral">Dismiss the suggestion</h2>
        <p className="text-sm text-neutral-subtle">
          {p.sender_name} will know you passed on {p.plan.name}. Telling them why is optional and helps them suggest
          something better.
        </p>
        <RadioGroup.Root
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
        <div className="flex justify-end gap-3">
          <Button size="lg" variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={() => onDismiss(reason || undefined, note.trim() || undefined)}>
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
        <div className="mt-1 text-xs">
          {p.concession ? `${p.concession.label}. ` : ''}Open until {date(p.expires_at)}.
        </div>
      </Callout.Text>
    </Callout.Root>
  )
}

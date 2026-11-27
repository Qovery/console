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
import type { PlanProposal, ProposalDismissReason } from 'qovery-pricing-typescript-axios'
import { useState } from 'react'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { Banner, Button, Callout, Heading, Icon, InputTextArea, Modal, RadioGroup } from '@qovery/shared/ui'
import { useProposal } from './hooks/use-proposal/use-proposal'
import { date, money } from './utils/format'
import {
  BAR_TEXT,
  barClass,
  proposalHeading,
  proposalLine,
  proposalShortLine,
  snoozeLabel,
} from './utils/proposal-rules'

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
    <div className="rounded border border-neutral bg-surface-neutral p-4">
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
          <Button size="md" variant="outline" color="neutral" disabled={busy} onClick={() => onReview(p)}>
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
          <span className="text-sm">We will email you a reminder then.</span>
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
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <Dialog.Title asChild>
            <Heading level={2}>Dismiss the suggestion</Heading>
          </Dialog.Title>
          <Dialog.Description className="text-sm text-neutral-subtle">
            {p.sender_name || 'The Qovery team'} will know you passed on {p.plan.name}. Telling them why is optional and
            helps them suggest something better.
          </Dialog.Description>
        </div>
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

export function ProposalLoadError({ retry }: { retry: () => void }) {
  return (
    <Callout.Root color="red" role="alert">
      <Callout.Text>
        <Callout.TextHeading>Plan proposal could not be loaded</Callout.TextHeading>
      </Callout.Text>
      <Button size="sm" variant="outline" color="neutral" onClick={retry}>
        Retry
      </Button>
    </Callout.Root>
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
  const loadError = pr.loadError && <ProposalLoadError retry={pr.retry} />
  if (!pr.proposal) return loadError
  if (variant === 'bar')
    return (
      <>
        {loadError}
        <ProposalBanner proposal={pr.proposal} variant="bar" onReview={onReview} />
      </>
    )
  return (
    <>
      {loadError}
      <ProposalBanner
        proposal={pr.proposal}
        onReview={onReview}
        error={pr.error}
        busy={pr.busy}
        onSnooze={client.snoozeProposal ? pr.snooze : undefined}
        onDismiss={client.dismissProposal ? pr.dismiss : undefined}
      />
    </>
  )
}

/** In the plan change review: who suggested it, their message, and the concession. */
export function ProposalNote({ proposal: p }: { proposal: PlanProposal }) {
  return (
    <Callout.Root color="sky">
      <Callout.Icon>
        <Icon iconName="envelope-open-text" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>{proposalHeading(p)}</Callout.TextHeading>
        {p.message && <div className="whitespace-pre-line">{p.message}</div>}
        <div className="mt-1 text-sm">Open until {date(p.expires_at)}.</div>
      </Callout.Text>
    </Callout.Root>
  )
}

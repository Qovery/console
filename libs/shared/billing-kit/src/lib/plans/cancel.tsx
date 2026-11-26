/*
 * Cancelling at the end of the term, and changing one's mind. The dialog says plainly when the
 * subscription ends, what stops and what keeps running, asks why (required) and for optional
 * feedback, and has the organization's name typed to confirm. A contract or a notice period sends
 * a request staff confirm instead. The banners on the usage page show what is planned (a plan
 * change at the renewal, the end of the subscription, a request) with the way back.
 */
import { useState } from 'react'
import { Button, Callout, Icon, InputText, InputTextArea, Modal, RadioGroup } from '@qovery/shared/ui'
import { errorText, notifySuccess } from '../components/parts'
import type { PricingClient } from '../data-access/client'
import type { CancelReason, Cancellation, ScheduledChange } from '../types'
import { date } from '../utils/format'

export const CANCEL_FEEDBACK_MAX = 1000

export function CancelDialog({
  organizationId,
  client,
  view,
  onClose,
  onDone,
}: {
  organizationId: string
  client: PricingClient
  view: Cancellation
  onClose: () => void
  onDone: () => void
}) {
  const [reason, setReason] = useState<CancelReason | ''>('')
  const [feedback, setFeedback] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const request = view.mode === 'request'
  const tooLong = [...feedback].length > CANCEL_FEEDBACK_MAX
  const ready = !!reason && confirm === view.organization_name && !tooLong
  async function submit() {
    if (!ready || !reason) return
    setBusy(true)
    setError('')
    try {
      const r = await client.cancel!(organizationId, { confirm, reason, feedback: feedback.trim() || undefined })
      notifySuccess(
        client,
        r.status === 'requested' ? 'Request sent' : 'Subscription cancelled',
        r.status === 'requested'
          ? 'We confirm the end date with you.'
          : `It ends on ${date(r.cancellation?.ends_on ?? view.ends_on)}.`
      )
      onDone()
      onClose()
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o && !busy) onClose()
      }}
      width="min(600px, calc(100vw - 24px))"
      buttonClose={false}
    >
      <div className="flex max-h-[75vh] flex-col">
        <div className="border-b border-neutral px-6 py-4">
          <h2 className="h4 text-neutral">
            {request ? 'Ask to cancel your subscription' : 'Cancel your subscription'}
          </h2>
          <p className="text-sm text-neutral-subtle">{view.organization_name}</p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5 text-sm text-neutral">
          {client.mode === 'preview' && (
            <Callout.Root color="sky">
              <Callout.Text>Preview: nothing is cancelled.</Callout.Text>
            </Callout.Root>
          )}
          {request ? (
            <p>
              {view.notice_days > 0 ? (
                <>
                  Your contract asks for {view.notice_days} days' notice. Sent today, your subscription would end on{' '}
                  <strong>{date(view.ends_on)}</strong>.
                </>
              ) : (
                <>
                  Your subscription is set by your contract. Sent today, it would end on{' '}
                  <strong>{date(view.ends_on)}</strong>.
                </>
              )}{' '}
              Your account manager confirms the end date with you before anything changes.
            </p>
          ) : (
            <p>
              Your subscription ends on <strong>{date(view.ends_on)}</strong>, the end of the period you paid for.
              Nothing is billed after that, and nothing is refunded before.
            </p>
          )}
          <div className="rounded border border-neutral bg-surface-neutral p-4">
            <div className="mb-2 font-medium">From {date(view.ends_on)}</div>
            <ul className="flex flex-col gap-1.5 text-neutral-subtle">
              <li className="flex gap-2">
                <Icon iconName="pause" iconStyle="regular" className="mt-0.5 text-warning" />
                New deployments are paused.
              </li>
              <li className="flex gap-2">
                <Icon iconName="circle-check" iconStyle="regular" className="mt-0.5 text-positive" />
                Running applications, databases and clusters keep running. Qovery never stops or deletes them.
              </li>
              <li className="flex gap-2">
                <Icon iconName="arrow-right" iconStyle="regular" className="mt-0.5" />
                You turn your resources off, or move them, when you are ready.
              </li>
              {view.support_days > 0 && (
                <li className="flex gap-2">
                  <Icon iconName="comments" iconStyle="regular" className="mt-0.5" />
                  Our support stays with you on Slack until {date(view.support_until)}.
                </li>
              )}
            </ul>
            <p className="mt-3 text-sm text-neutral-subtle">
              Until then, everything works as today, and you can keep your subscription at any time.
            </p>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-medium">Why are you leaving?</legend>
            <RadioGroup.Root
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              value={reason}
              onValueChange={(v) => setReason(v as CancelReason)}
            >
              {view.reasons.map((r) => (
                <label
                  key={r.code}
                  htmlFor={`reason-${r.code}`}
                  className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 ${reason === r.code ? 'border-brand-strong' : 'border-neutral'}`}
                >
                  <RadioGroup.Item id={`reason-${r.code}`} value={r.code} />
                  {r.label}
                </label>
              ))}
            </RadioGroup.Root>
          </fieldset>
          <InputTextArea
            name="cancel_feedback"
            label="Anything we should know? (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.currentTarget.value)}
            hint={`${[...feedback].length} / ${CANCEL_FEEDBACK_MAX}`}
            error={tooLong ? `${CANCEL_FEEDBACK_MAX} characters at most` : undefined}
          />
          <InputText
            name="cancel_confirm"
            label={`Type ${view.organization_name} to confirm`}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
          />
          {error && (
            <p role="alert" className="text-negative">
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral px-6 py-3">
          <Button size="lg" variant="plain" color="neutral" onClick={onClose} disabled={busy}>
            Keep my subscription
          </Button>
          <Button size="lg" color="red" disabled={busy || !ready} loading={busy} onClick={submit}>
            {request ? 'Send the request' : `Cancel on ${date(view.ends_on)}`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/** What is planned for this subscription, with the way back. Billing roles only. */
export function PlannedBanners({
  organizationId,
  client,
  scheduled,
  cancellation,
  onChanged,
}: {
  organizationId: string
  client: PricingClient
  scheduled?: ScheduledChange | null
  cancellation?: Cancellation
  onChanged: () => void
}) {
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const cur = cancellation?.current
  async function run(what: string, fn: () => Promise<unknown>, done: string) {
    setBusy(what)
    setError('')
    try {
      await fn()
      notifySuccess(client, done)
      onChanged()
    } catch (e) {
      setError(errorText(e))
    }
    setBusy('')
  }
  return (
    <>
      {cur?.status === 'scheduled' && (
        <Callout.Root color="yellow">
          <Callout.Icon>
            <Icon iconName="calendar-xmark" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Your subscription ends on {date(cur.ends_on)}</Callout.TextHeading>
            Everything works until then. From that day new deployments are paused; running resources keep running.
            {client.keepSubscription && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  color="neutral"
                  loading={busy === 'sub'}
                  onClick={() =>
                    run('sub', () => client.keepSubscription!(organizationId), 'Your subscription continues')
                  }
                >
                  Keep my subscription
                </Button>
              </div>
            )}
          </Callout.Text>
        </Callout.Root>
      )}
      {cur?.status === 'requested' && (
        <Callout.Root color="neutral">
          <Callout.Icon>
            <Icon iconName="paper-plane" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Cancellation requested</Callout.TextHeading>
            You asked on {date(cur.requested_at)} to end the subscription on {date(cur.ends_on)}. Your account manager
            confirms it with you.
            {client.keepSubscription && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  color="neutral"
                  loading={busy === 'sub'}
                  onClick={() => run('sub', () => client.keepSubscription!(organizationId), 'Request withdrawn')}
                >
                  Withdraw the request
                </Button>
              </div>
            )}
          </Callout.Text>
        </Callout.Root>
      )}
      {scheduled && cur?.status !== 'scheduled' && (
        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="calendar" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>
              Your plan changes to {scheduled.name} on {date(scheduled.effective_on)}
            </Callout.TextHeading>
            You keep your current plan and its limits until then.
            {client.keepPlan && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  color="neutral"
                  loading={busy === 'plan'}
                  onClick={() => run('plan', () => client.keepPlan!(organizationId), 'You keep your current plan')}
                >
                  Keep my current plan
                </Button>
              </div>
            )}
          </Callout.Text>
        </Callout.Root>
      )}
      {error && (
        <p role="alert" className="text-sm text-negative">
          {error}
        </p>
      )}
    </>
  )
}

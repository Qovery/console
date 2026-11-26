/*
 * The console's billing settings, from pricing-api's customer API (billing roles only), one card
 * per subject with its own action, like Vercel's billing settings:
 *  - Payment method: the card on file, "Update payment method" (Chargebee's own page: the card
 *    never reaches Qovery), and paying through AWS Marketplace as the alternative.
 *  - Billing information: what invoices carry and where they are sent.
 *  - Billing contacts: who else receives the invoices, when Chargebee has some.
 *
 *   <BillingSettingsPage organizationId={id} client={client} />
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge, Button, Callout, Icon, InputText, InputTextArea } from '@qovery/shared/ui'
import { BillingAlerts } from './billing-alerts'
import { BillingError, type PricingClient } from './client'
import { EmptyState } from './invoices-page'
import {
  type Access,
  BillingRolesOnly,
  CardSkeleton,
  SectionCard,
  errorText,
  isBillingAccess,
  notifySuccess,
  openExternal,
  useAccess,
} from './parts'
import {
  INTERNAL_NOTHING_BILLED,
  cardState,
  emptyBillingInfo,
  localDate,
  normalizeBillingInfo,
  paymentMethodLabel,
  validAwsAccountId,
  validOfferURL,
  validateBillingInfo,
} from './rules'
import type { AwsMarketplace, BillingInfo, BillingInfoView, PaymentMethods } from './types'

export interface BillingSettingsPageProps {
  organizationId: string
  client: PricingClient
  /** The person's access when the host knows it; otherwise read from the usage API. */
  access?: Access
  /** Where Chargebee sends the person back after changing the card (a console URL); default: this page. */
  returnUrl?: string
  /** Shows <BillingAlerts> (an overdue invoice, a card that expires) at the top of the page (default). Hosts that place alerts themselves pass false. */
  alerts?: boolean
  /** Where the alerts' buttons go. */
  onNavigate?: (to: 'invoices' | 'billing') => void
}

export function BillingSettingsPage({
  organizationId,
  client,
  access: given,
  returnUrl,
  alerts = true,
  onNavigate,
}: BillingSettingsPageProps) {
  const { access, error: accessError, retry: retryAccess } = useAccess(client, organizationId, given)
  if (accessError)
    return (
      <Callout.Root color="red">
        <Callout.Text>
          <Callout.TextHeading>Billing access could not be loaded</Callout.TextHeading>
          {accessError}
        </Callout.Text>
        <Button size="sm" variant="outline" color="neutral" onClick={retryAccess}>
          Retry
        </Button>
      </Callout.Root>
    )
  if (!access)
    return (
      <div className="rounded border border-neutral bg-surface-neutral p-5">
        <CardSkeleton lines={4} />
      </div>
    )
  if (!isBillingAccess(access) || !client.paymentMethods) return <BillingRolesOnly />
  return <BillingSettings key={organizationId} {...{ organizationId, client, access, returnUrl, alerts, onNavigate }} />
}

function BillingSettings({ organizationId, client, access, returnUrl, alerts, onNavigate }: BillingSettingsPageProps) {
  const { pm, paymentError, setPaymentError, loadPaymentMethods } = usePaymentMethods(client, organizationId)
  const [aws, setAws] = useState<AwsMarketplace>()
  const [awsError, setAwsError] = useState('')
  const loadAws = useCallback(() => {
    setAwsError('')
    client
      .awsMarketplace?.(organizationId)
      .then(setAws)
      .catch((e) => setAwsError(errorText(e)))
  }, [client, organizationId])
  useEffect(loadAws, [loadAws])
  const onAws = aws?.billing_channel === 'aws_marketplace' || aws?.request?.status === 'accepted'
  // One of Qovery's own organizations: no card, no billing information, nothing to pay.
  if (aws?.billing_channel === 'internal')
    return (
      <EmptyState
        title={INTERNAL_NOTHING_BILLED}
        body="This organization is one of Qovery's own: there is no payment method or billing information to manage."
      />
    )
  return (
    <div className="flex flex-col gap-6">
      {alerts && (
        <BillingAlerts
          organizationId={organizationId}
          client={client}
          access={access}
          onNavigate={onNavigate}
          paymentMethods={{ data: pm }}
        />
      )}
      <PaymentMethodCard
        {...{ organizationId, client, onAws, returnUrl, pm, paymentError, setPaymentError, loadPaymentMethods }}
      />
      {client.awsMarketplace && (
        <AwsMarketplaceCard
          {...{ organizationId, client, aws, onChange: setAws, onAws, loadError: awsError, onRetry: loadAws }}
        />
      )}
      {client.billingInfo && <BillingInfoCard organizationId={organizationId} client={client} />}
    </div>
  )
}

// ------------------------------------------------------------------ payment method

function usePaymentMethods(client: PricingClient, organizationId: string) {
  const [pm, setPm] = useState<PaymentMethods>()
  const [paymentError, setPaymentError] = useState('')
  const loadPaymentMethods = useCallback(() => {
    client.paymentMethods!(organizationId)
      .then((x) => {
        setPm(x)
        setPaymentError('')
      })
      .catch((e) => {
        setPaymentError(
          e instanceof BillingError && e.code === 'INTERNAL_ACCOUNT'
            ? `${INTERNAL_NOTHING_BILLED}.`
            : e instanceof BillingError && e.code === 'BILLING_NOT_LINKED'
              ? 'Billing is not set up for this organization yet.'
              : errorText(e)
        )
      })
  }, [client, organizationId])
  useEffect(loadPaymentMethods, [loadPaymentMethods])
  return { pm, paymentError, setPaymentError, loadPaymentMethods }
}

function PaymentMethodCard({
  organizationId,
  client,
  onAws,
  returnUrl,
  pm,
  paymentError: error,
  setPaymentError: setError,
  loadPaymentMethods: load,
}: {
  organizationId: string
  client: PricingClient
  onAws: boolean
  returnUrl?: string
} & ReturnType<typeof usePaymentMethods>) {
  const [busy, setBusy] = useState(false)
  const [link, setLink] = useState('')
  const waiting = useRef(false)
  // Back from Chargebee's page (another tab): read the card again.
  useEffect(() => {
    const onFocus = () => {
      if (waiting.current) {
        waiting.current = false
        load()
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  async function update() {
    setBusy(true)
    setError('')
    setLink('')
    try {
      const s = await client.paymentMethodSession!(organizationId, returnUrl ?? window.location.href)
      if (s.url) {
        waiting.current = true
        setLink(s.url)
        openExternal(s.url)
      }
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }

  if (onAws) {
    return (
      <SectionCard title="Payment method" description="How you pay for Qovery.">
        <p className="text-sm text-neutral">
          You pay through AWS Marketplace. Invoices come from AWS, and card payments do not apply.
        </p>
      </SectionCard>
    )
  }
  const actions = pm?.actions_available ?? false
  return (
    <SectionCard
      title="Payment method"
      description="The card Chargebee charges for your invoices. You change it on Chargebee's secure page: card details never reach Qovery."
      footer={
        <>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-auto text-sm text-brand hover:underline"
            >
              The page did not open? Open it here
            </a>
          )}
          <Button size="md" loading={busy} disabled={!pm || !actions} onClick={update}>
            {pm && pm.payment_methods.length === 0 ? 'Add a payment method' : 'Update payment method'}
          </Button>
        </>
      }
    >
      {!pm && !error && <CardSkeleton lines={2} />}
      {error && (
        <p role="alert" className="text-sm text-negative">
          {error}
        </p>
      )}
      {pm && pm.payment_methods.length === 0 && (
        <p className="text-sm text-neutral-subtle">
          No payment method on file. Add a card so invoices are paid automatically.
        </p>
      )}
      {pm && pm.payment_methods.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pm.payment_methods.map((m, i) => {
            const state = cardState(m)
            return (
              <li key={i} className="flex flex-wrap items-center gap-3 rounded border border-neutral px-4 py-3">
                <Icon
                  iconName={m.type === 'card' ? 'credit-card' : 'building-columns'}
                  iconStyle="regular"
                  className="text-neutral-subtle"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-neutral">{paymentMethodLabel(m)}</div>
                  {m.expiry_month && m.expiry_year ? (
                    <div className="text-sm text-neutral-subtle">
                      Expires {String(m.expiry_month).padStart(2, '0')}/{m.expiry_year}
                    </div>
                  ) : null}
                </div>
                {m.primary && (
                  <Badge className="font-medium" color="neutral" variant="surface" size="sm">
                    Default
                  </Badge>
                )}
                {state === 'expired' && (
                  <Badge className="font-medium" color="red" variant="surface" size="sm">
                    Expired
                  </Badge>
                )}
                {state === 'expiring' && (
                  <Badge className="font-medium" color="yellow" variant="surface" size="sm">
                    Expires soon
                  </Badge>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {pm && !actions && <p className="text-sm text-neutral-subtle">Billing changes are not available yet.</p>}
    </SectionCard>
  )
}

// ------------------------------------------------------------------ AWS Marketplace

function AwsMarketplaceCard({
  organizationId,
  client,
  aws,
  onChange,
  onAws,
  loadError,
  onRetry,
}: {
  organizationId: string
  client: PricingClient
  aws?: AwsMarketplace
  onChange: (a: AwsMarketplace) => void
  onAws: boolean
  loadError: string
  onRetry: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [accountId, setAccountId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<{ field?: 'aws_account_id' | 'message'; text: string }>()
  const [busy, setBusy] = useState(false)
  const req = aws?.request
  const status = onAws ? 'accepted' : req && req.status !== 'closed' ? req.status : 'none'

  function edit() {
    setAccountId(req && req.status !== 'closed' ? req.aws_account_id : '')
    setMessage(req && req.status !== 'closed' ? req.message : '')
    setError(undefined)
    setEditing(true)
  }
  async function submit() {
    const id = accountId.replace(/[\s-]/g, '')
    if (!validAwsAccountId(id)) return setError({ field: 'aws_account_id', text: 'The AWS account ID is 12 digits.' })
    if (message.length > 1000) return setError({ field: 'message', text: '1000 characters at most.' })
    setBusy(true)
    setError(undefined)
    try {
      onChange(
        await client.requestAwsOffer!(organizationId, { aws_account_id: id, message: message.trim() || undefined })
      )
      setEditing(false)
      notifySuccess(
        client,
        'Request sent',
        'Your Qovery account manager prepares the private offer. It shows here when it is ready.'
      )
    } catch (e) {
      const be = e instanceof BillingError ? e : undefined
      setError({
        field:
          be?.code === 'INVALID_AWS_ACCOUNT_ID'
            ? 'aws_account_id'
            : be?.code === 'MESSAGE_TOO_LONG'
              ? 'message'
              : undefined,
        text:
          be?.code === 'TOO_MANY_REQUESTS'
            ? 'Too many requests today. Try again tomorrow, or contact your account manager.'
            : errorText(e),
      })
    }
    setBusy(false)
  }

  const form = (
    <div className="flex flex-col gap-3">
      <InputText
        name="aws_account_id"
        label="AWS account ID"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        hint="The 12-digit ID of the AWS account that will accept the offer."
        error={error?.field === 'aws_account_id' ? error.text : undefined}
      />
      <InputTextArea
        name="aws_message"
        label="Message (optional)"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        hint="Anything your account manager should know: the plan, the term, a deadline."
        error={error?.field === 'message' ? error.text : undefined}
      />
      {error && !error.field && (
        <p role="alert" className="text-sm text-negative">
          {error.text}
        </p>
      )}
    </div>
  )
  const footer = !aws ? undefined : editing ? (
    <>
      <Button size="md" variant="plain" color="neutral" onClick={() => setEditing(false)}>
        Cancel
      </Button>
      <Button size="md" loading={busy} onClick={submit}>
        {status === 'none' ? 'Request a private offer' : 'Save request'}
      </Button>
    </>
  ) : status === 'none' ? (
    <Button size="md" variant="outline" color="neutral" onClick={edit}>
      Request a private offer
    </Button>
  ) : status === 'open' || status === 'offer_sent' ? (
    <Button size="md" variant="outline" color="neutral" onClick={edit}>
      Edit request
    </Button>
  ) : undefined

  return (
    <SectionCard
      title="Pay through AWS Marketplace"
      description="Use your AWS commitment to pay for Qovery: we send you a private offer, you accept it in AWS, and AWS bills you."
      footer={footer}
    >
      {!aws && !loadError && <CardSkeleton lines={2} />}
      {loadError && (
        <Callout.Root color="red">
          <Callout.Text>
            <Callout.TextHeading>AWS Marketplace status could not be loaded</Callout.TextHeading>
            {loadError}
          </Callout.Text>
          <Button size="sm" variant="outline" color="neutral" onClick={onRetry}>
            Retry
          </Button>
        </Callout.Root>
      )}
      {aws && !editing && status === 'none' && (
        <p className="text-sm text-neutral-subtle">Not requested. You pay by card or invoice today.</p>
      )}
      {aws && !editing && status === 'open' && req && (
        <p className="text-sm text-neutral">
          Requested on {localDate(req.requested_at)} for AWS account <span>{req.aws_account_id}</span>. Your account
          manager is preparing the offer.
        </p>
      )}
      {aws && !editing && status === 'offer_sent' && (
        <div className="flex flex-col gap-2 text-sm">
          <div className="font-medium text-neutral">Your private offer is ready</div>
          {aws.offer?.note && <p className="text-neutral-subtle">{aws.offer.note}</p>}
          {aws.offer?.expires_at && (
            <p className="text-neutral-subtle">Accept it before {localDate(aws.offer.expires_at)}.</p>
          )}
          {validOfferURL(aws.offer?.url) ? (
            <a
              href={aws.offer!.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
            >
              Review and accept in AWS
              <Icon iconName="arrow-up-right-from-square" iconStyle="regular" />
            </a>
          ) : (
            <p className="text-neutral-subtle">Your account manager sends you the link to the offer.</p>
          )}
        </div>
      )}
      {aws && status === 'accepted' && (
        <p className="text-sm text-neutral">
          You pay through AWS Marketplace; invoices come from AWS. Contact your account manager to change the offer.
        </p>
      )}
      {editing && form}
    </SectionCard>
  )
}

// ------------------------------------------------------------------ billing information

type Field = keyof BillingInfo
const FIELDS: { k: Field; label: string; hint?: string; wide?: boolean; type?: 'email' }[] = [
  { k: 'company', label: 'Company name', hint: 'The legal name printed on invoices.', wide: true },
  {
    k: 'email',
    label: 'Billing email',
    hint: 'Invoices and receipts are sent to this address.',
    wide: true,
    type: 'email',
  },
  { k: 'first_name', label: 'First name', hint: 'The billing contact.' },
  { k: 'last_name', label: 'Last name' },
  { k: 'line1', label: 'Address', wide: true },
  { k: 'line2', label: 'Address line 2 (optional)', wide: true },
  { k: 'city', label: 'City' },
  { k: 'zip', label: 'Postal code' },
  { k: 'state', label: 'State or region (optional)' },
  { k: 'country', label: 'Country', hint: 'Two-letter code, e.g. FR, DE or US.' },
  {
    k: 'vat_number',
    label: 'VAT or tax ID (optional)',
    hint: 'With the country prefix, e.g. FR12345678901. Checked by our billing system.',
    wide: true,
  },
]

function BillingInfoCard({ organizationId, client }: { organizationId: string; client: PricingClient }) {
  const [saved, setSaved] = useState<BillingInfoView>()
  const [form, setForm] = useState<BillingInfo>(emptyBillingInfo)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const take = (v: BillingInfoView) => {
    setSaved(v)
    setForm(FIELDS.reduce((b, f) => ({ ...b, [f.k]: v[f.k] ?? '' }), { ...emptyBillingInfo }))
  }
  useEffect(() => {
    client.billingInfo!(organizationId)
      .then(take)
      .catch((e) =>
        setError(
          e instanceof BillingError && e.code === 'INTERNAL_ACCOUNT'
            ? `${INTERNAL_NOTHING_BILLED}.`
            : e instanceof BillingError && e.code === 'BILLING_NOT_LINKED'
              ? 'Billing is not set up for this organization yet.'
              : errorText(e)
        )
      )
  }, [client, organizationId])

  const dirty = !!saved && FIELDS.some((f) => (saved[f.k] ?? '') !== form[f.k])
  const actions = saved?.actions_available ?? false
  const set = (k: Field, v: string) => {
    const next = { ...form, [k]: v }
    setForm(next)
    if (touched[k]) setErrors((e) => ({ ...e, [k]: validateBillingInfo(next)[k] }))
  }
  async function save() {
    const all = validateBillingInfo(form)
    setErrors(all)
    setTouched(FIELDS.reduce((t, f) => ({ ...t, [f.k]: true }), {}))
    if (Object.keys(all).length) return
    setBusy(true)
    setError('')
    try {
      take(await client.saveBillingInfo!(organizationId, normalizeBillingInfo(form)))
      notifySuccess(client, 'Billing information saved', 'Your next invoices use it.')
    } catch (e) {
      const be = e instanceof BillingError ? e : undefined
      if (be?.field && FIELDS.some((f) => f.k === be.field))
        setErrors((x) => ({ ...x, [be.field as Field]: be.message.replace(/^./, (c) => c.toUpperCase()) }))
      else setError(errorText(e))
    }
    setBusy(false)
  }

  return (
    <>
      <SectionCard
        title="Billing information"
        description="What your invoices carry and where they are sent. Changes apply to the next invoices."
        footer={
          saved && (
            <>
              {!actions && (
                <span className="mr-auto text-sm text-neutral-subtle">Billing changes are not available yet.</span>
              )}
              {dirty && (
                <Button
                  size="md"
                  variant="plain"
                  color="neutral"
                  disabled={busy}
                  onClick={() => {
                    take(saved)
                    setErrors({})
                    setTouched({})
                  }}
                >
                  Discard
                </Button>
              )}
              <Button size="md" loading={busy} disabled={busy || !dirty || !actions} onClick={save}>
                Save
              </Button>
            </>
          )
        }
      >
        {!saved && !error && <CardSkeleton lines={5} />}
        {error && (
          <p role="alert" className="text-sm text-negative">
            {error}
          </p>
        )}
        {saved && (
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (dirty && actions && !busy) save()
            }}
            noValidate
          >
            {FIELDS.map((f) => (
              <div key={f.k} className={f.wide ? 'sm:col-span-2' : ''}>
                <InputText
                  name={`billing_${f.k}`}
                  label={f.label}
                  type={f.type}
                  value={form[f.k]}
                  hint={f.hint}
                  disabled={busy || !actions}
                  autoComplete={f.k === 'email' ? 'email' : f.k === 'company' ? 'organization' : undefined}
                  onChange={(e) => set(f.k, e.target.value)}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, [f.k]: true }))
                    setErrors((x) => ({ ...x, [f.k]: validateBillingInfo(form)[f.k] }))
                  }}
                  error={errors[f.k]}
                />
              </div>
            ))}
          </form>
        )}
      </SectionCard>
      {saved && saved.contacts.length > 0 && (
        <SectionCard
          title="Billing contacts"
          description="They also receive your invoices. Ask your account manager to change this list."
        >
          <ul className="flex flex-col gap-1 text-sm">
            {saved.contacts.map((c) => (
              <li key={c.email} className="text-neutral">
                {c.name ? `${c.name} · ` : ''}
                <span className="text-neutral-subtle">{c.email}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </>
  )
}

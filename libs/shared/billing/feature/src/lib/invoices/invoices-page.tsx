/*
 * The console's invoices page, from pricing-api's customer API (billing roles only): what is
 * overdue first, then every invoice with status and year filters, "Details" (the lines and the
 * usage behind them, <InvoiceDetailsModal>) and a download per row, a download for the filtered
 * rows, and "Pay now" on unpaid ones (the card on file is charged after a confirm).
 *
 *   <InvoicesPage organizationId={id} client={client} onManagePaymentMethod={() => navigate('…/billing')} />
 */
import * as Dialog from '@radix-ui/react-dialog'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BillingError,
  type CustomerInvoice,
  type InvoicePage,
  type PricingClient,
} from '@qovery/shared/billing/data-access'
import {
  Badge,
  Button,
  Callout,
  EmptyState as ConsoleEmptyState,
  Heading,
  Icon,
  Modal,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { BillingAlerts } from '../components/billing-alerts'
import { CompactSelect } from '../components/compact-select'
import {
  type Access,
  BillingRolesOnly,
  CardSkeleton,
  errorText,
  isBillingAccess,
  notifySuccess,
  openExternal,
  startDownload,
  useAccess,
} from '../components/parts'
import {
  INTERNAL_NOTHING_BILLED,
  type StatusFilter,
  amount,
  amountDue,
  filterInvoices,
  invoiceStatus,
  invoiceYears,
  localDate,
  minutesToWait,
  newIdempotencyKey,
  runSequential,
} from '../utils/rules'
import { InvoiceDetailsModal } from './invoice-details'

export interface InvoicesPageProps {
  organizationId: string
  client: PricingClient
  /** Opens where the card is changed (the Billing settings page). Without it, Chargebee's page opens here. */
  onManagePaymentMethod?: () => void
  /** The person's access when the host knows it; otherwise read from the usage API. */
  access?: Access
  /** Shows <BillingAlerts> (a card that expires) at the top of the page (default). Hosts that place alerts themselves pass false. */
  alerts?: boolean
  /** Where the alerts' buttons go. */
  onNavigate?: (to: 'invoices' | 'billing') => void
}

type PayState = { error?: string; payment?: boolean; until?: number }

/** Opens Chargebee's page to change the card, when the host has no page of its own for it. */
export async function openPaymentMethodPage(client: PricingClient, organizationId: string) {
  const s = await client.paymentMethodSession?.(
    organizationId,
    typeof window !== 'undefined' ? window.location.href : undefined
  )
  if (s?.url) openExternal(s.url)
}

export function InvoicesPage({
  organizationId,
  client,
  onManagePaymentMethod,
  access: given,
  alerts = true,
  onNavigate,
}: InvoicesPageProps) {
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
  if (!isBillingAccess(access) || !client.invoices) return <BillingRolesOnly />
  return (
    <div className="flex flex-col gap-8">
      {/* The page has its own overdue banner. */}
      {alerts && (
        <BillingAlerts
          organizationId={organizationId}
          client={client}
          access={access}
          hide={['overdue']}
          onNavigate={onNavigate}
        />
      )}
      <Invoices
        key={organizationId}
        organizationId={organizationId}
        client={client}
        onManagePaymentMethod={onManagePaymentMethod}
      />
    </div>
  )
}

function Invoices({ organizationId, client, onManagePaymentMethod }: Omit<InvoicesPageProps, 'access'>) {
  const [page, setPage] = useState<InvoicePage>()
  const [rows, setRows] = useState<CustomerInvoice[]>([])
  const [error, setError] = useState<BillingError | Error>()
  const [loadingMore, setLoadingMore] = useState(false)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [year, setYear] = useState<number | 'all'>('all')
  const [confirm, setConfirm] = useState<CustomerInvoice>()
  const [details, setDetails] = useState<CustomerInvoice>()
  const [paying, setPaying] = useState('')
  const [pay, setPay] = useState<Record<string, PayState>>({})
  const [downloading, setDownloading] = useState('')
  const [bulk, setBulk] = useState<{ done: number; failed: number; total: number }>()
  const abort = useRef<AbortController | undefined>(undefined)
  const pagesLoaded = useRef(1)
  const requestVersion = useRef(0)
  const collectKeys = useRef(new Map<string, string>())
  const collecting = useRef(false)
  const [, tick] = useState(0)

  const load = useCallback(async () => {
    const version = ++requestVersion.current
    try {
      let nextPage = await client.invoices!(organizationId)
      const invoices = new Map(nextPage.invoices.map((invoice) => [invoice.id, invoice]))
      let count = 1
      while (version === requestVersion.current && count < pagesLoaded.current && nextPage.next_offset) {
        nextPage = await client.invoices!(organizationId, { offset: nextPage.next_offset })
        for (const invoice of nextPage.invoices) invoices.set(invoice.id, invoice)
        count++
      }
      if (version !== requestVersion.current) return
      pagesLoaded.current = count
      setPage(nextPage)
      setRows([...invoices.values()])
      setError(undefined)
    } catch (e) {
      if (version === requestVersion.current) setError(e as Error)
    }
  }, [client, organizationId])
  useEffect(() => {
    void load()
    return () => {
      requestVersion.current++
    }
  }, [load])
  // Re-render once a minute so "try again in N minutes" counts down and the button comes back.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => () => abort.current?.abort(), [])

  const shown = useMemo(() => filterInvoices(rows, status, year), [rows, status, year])
  const due = useMemo(() => amountDue(rows), [rows])
  const years = useMemo(() => invoiceYears(rows), [rows])

  if (error instanceof BillingError && error.code === 'BILLING_ROLE_REQUIRED') return <BillingRolesOnly />
  if (error instanceof BillingError && error.code === 'INTERNAL_ACCOUNT')
    return (
      <EmptyState
        title={INTERNAL_NOTHING_BILLED}
        body="This organization is one of Qovery's own: there are no invoices."
      />
    )
  if (error instanceof BillingError && error.code === 'BILLING_NOT_LINKED') {
    return (
      <EmptyState title="Billing is not set up yet" body="Invoices show here once this organization has a paid plan." />
    )
  }
  if (error && !page)
    return (
      <Callout.Root color="red">
        <Callout.Text>
          <Callout.TextHeading>Invoices could not be loaded</Callout.TextHeading>
          {errorText(error)}{' '}
          <button type="button" className="font-medium underline" onClick={load}>
            Try again
          </button>
        </Callout.Text>
      </Callout.Root>
    )
  if (!page)
    return (
      <div className="rounded border border-neutral bg-surface-neutral p-5">
        <CardSkeleton lines={5} />
      </div>
    )

  const aws = page.billing_channel === 'aws_marketplace'
  const actions = page.actions_available
  const updateCard = () =>
    onManagePaymentMethod
      ? onManagePaymentMethod()
      : openPaymentMethodPage(client, organizationId).catch((e) => setError(e))
  const oldestDue = [...rows].filter((r) => r.collectable).sort((a, b) => a.date.localeCompare(b.date))[0]

  async function loadMore() {
    if (!page?.next_offset || loadingMore) return
    const version = requestVersion.current
    setLoadingMore(true)
    try {
      const next = await client.invoices!(organizationId, { offset: page.next_offset })
      if (version !== requestVersion.current) return
      pagesLoaded.current++
      setPage(next)
      setRows((r) => [...r, ...next.invoices.filter((i) => !r.some((x) => x.id === i.id))])
    } catch (e) {
      if (version === requestVersion.current) setError(e as Error)
    } finally {
      setLoadingMore(false)
    }
  }

  async function download(inv: CustomerInvoice) {
    const d = await client.invoicePdf!(organizationId, inv.id)
    if (d.download_url) startDownload(d.download_url)
  }

  async function downloadOne(inv: CustomerInvoice) {
    setDownloading(inv.id)
    try {
      await download(inv)
    } catch (e) {
      setPay((p) => ({ ...p, [inv.id]: { ...p[inv.id], error: `Download failed: ${errorText(e)}` } }))
    }
    setDownloading('')
  }

  async function downloadAll() {
    const list = shown
    const ac = new AbortController()
    abort.current = ac
    setBulk({ done: 0, failed: 0, total: list.length })
    const r = await runSequential(list, download, {
      gapMs: 800,
      signal: ac.signal,
      onProgress: (done, failed) => setBulk({ done, failed, total: list.length }),
    })
    setBulk(undefined)
    if (r.cancelled) notifySuccess(client, 'Download stopped', `${r.done} of ${list.length} downloaded.`)
    else if (r.failed)
      setError(new Error(`${r.failed} of ${list.length} invoices could not be downloaded. Try those again one by one.`))
    else notifySuccess(client, `${r.done} invoice${r.done === 1 ? '' : 's'} downloaded`)
  }

  async function collect(inv: CustomerInvoice) {
    if (collecting.current) return
    collecting.current = true
    const key = collectKeys.current.get(inv.id) ?? newIdempotencyKey()
    collectKeys.current.set(inv.id, key)
    setPaying(inv.id)
    setPay((p) => ({ ...p, [inv.id]: {} }))
    try {
      await client.collectInvoice!(organizationId, inv.id, key)
      collectKeys.current.delete(inv.id)
      setConfirm(undefined)
      notifySuccess(client, 'Payment received', `Invoice ${inv.id} is paid. Thank you.`)
      load()
    } catch (e) {
      const be = e instanceof BillingError ? e : undefined
      if (be && be.status < 500 && be.status !== 408) collectKeys.current.delete(inv.id)
      if (be?.code === 'PAYMENT_FAILED')
        setPay((p) => ({ ...p, [inv.id]: { error: `The payment failed: ${be.message}`, payment: true } }))
      else if (be?.code === 'COLLECT_TOO_SOON') {
        const secs = be.retryAfter ?? 600
        setPay((p) => ({
          ...p,
          [inv.id]: {
            error: `A payment was just tried. Try again in ${minutesToWait(secs)} minutes.`,
            until: Date.now() + secs * 1000,
          },
        }))
      } else if (be?.status === 409) {
        setPay((p) => ({ ...p, [inv.id]: { error: 'This invoice changed: the list is refreshed.' } }))
        load()
      } else setPay((p) => ({ ...p, [inv.id]: { error: errorText(e) } }))
      setConfirm(undefined)
    }
    collecting.current = false
    setPaying('')
  }

  return (
    <div className="flex flex-col gap-4">
      {aws && (
        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="aws" iconStyle="brands" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>You pay through AWS Marketplace</Callout.TextHeading>Your invoices come from AWS.
            Invoices below, if any, are from before the switch.
          </Callout.Text>
        </Callout.Root>
      )}
      {!aws && due.length > 0 && (
        <Callout.Root color="red">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>
              {due.map((d) => amount(d.amount, d.currency)).join(' + ')} is due
              {page.next_offset ? ' on loaded invoices' : ''}
            </Callout.TextHeading>
            {due.reduce((n, d) => n + d.count, 0) === 1
              ? 'One invoice is unpaid.'
              : `${due.reduce((n, d) => n + d.count, 0)} invoices are unpaid.`}{' '}
            Pay now with the card on file, or update your payment method first.
            <div className="mt-3 flex flex-wrap gap-2">
              {oldestDue && (
                <Button
                  size="md"
                  color="brand"
                  disabled={!actions || !!paying || payBlocked(pay[oldestDue.id])}
                  onClick={() => setConfirm(oldestDue)}
                >
                  Retry payment
                </Button>
              )}
              <Button size="md" variant="outline" color="neutral" disabled={!actions} onClick={updateCard}>
                Update payment method
              </Button>
            </div>
          </Callout.Text>
        </Callout.Root>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <CompactSelect
            ariaLabel="Status"
            value={status}
            onChange={(v) => setStatus(v as StatusFilter)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'paid', label: 'Paid' },
              { value: 'voided', label: 'Voided' },
            ]}
          />
          <CompactSelect
            ariaLabel="Year"
            value={String(year)}
            onChange={(v) => setYear(v === 'all' ? 'all' : Number(v))}
            options={[
              { value: 'all', label: 'All years' },
              ...years.map((y) => ({ value: String(y), label: String(y) })),
            ]}
          />
        </div>
        {bulk ? (
          <div className="flex items-center gap-3 text-sm text-neutral-subtle">
            <span aria-live="polite">
              Downloading {Math.min(bulk.done + bulk.failed + 1, bulk.total)} of {bulk.total}
              {bulk.failed ? ` (${bulk.failed} failed)` : ''}
            </span>
            <Button size="md" variant="outline" color="neutral" onClick={() => abort.current?.abort()}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="md"
            variant="outline"
            color="neutral"
            disabled={!actions || shown.length === 0}
            onClick={downloadAll}
          >
            <Icon iconName="download" iconStyle="regular" />
            {page.next_offset ? 'Download loaded invoices' : 'Download all'}
            {shown.length ? ` (${shown.length})` : ''}
          </Button>
        )}
      </div>
      {error && page && (
        <Callout.Root color="red">
          <Callout.Text>{errorText(error)}</Callout.Text>
        </Callout.Root>
      )}

      {rows.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          body="Your first invoice shows here at the end of your first billing period."
          action={
            !aws && onManagePaymentMethod
              ? { label: 'Add a payment method', onClick: onManagePaymentMethod }
              : undefined
          }
        />
      ) : shown.length === 0 ? (
        <EmptyState
          title="No invoice matches these filters"
          body="Change the status or the year to see more."
          action={{
            label: 'Show all invoices',
            onClick: () => {
              setStatus('all')
              setYear('all')
            },
          }}
        />
      ) : (
        <div className="overflow-hidden rounded border border-neutral bg-surface-neutral">
          <TablePrimitives.Table.Root containerClassName="border-0 rounded-none">
            <TablePrimitives.Table.Header className="text-xs">
              <TablePrimitives.Table.Row>
                <TablePrimitives.Table.ColumnHeaderCell>Date</TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell>Number</TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell>Status</TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell className="text-right">
                  Amount
                </TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell>Due</TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell className="text-right">
                  Actions
                </TablePrimitives.Table.ColumnHeaderCell>
              </TablePrimitives.Table.Row>
            </TablePrimitives.Table.Header>
            <TablePrimitives.Table.Body>
              {shown.map((inv) => {
                const st = invoiceStatus(inv)
                const ps = pay[inv.id]
                const blocked = payBlocked(ps)
                return (
                  <TablePrimitives.Table.Row key={inv.id}>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap font-medium">
                      {localDate(inv.date)}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap">{inv.id}</TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell>
                      <Badge className="font-medium" color={st.color} variant="surface" size="sm">
                        {st.label}
                      </Badge>
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-right tabular-nums">
                      {amount(inv.total, inv.currency)}
                      {inv.collectable && inv.amount_due !== inv.total ? (
                        <span className="block text-sm font-normal text-neutral-subtle">
                          {amount(inv.amount_due, inv.currency)} due
                        </span>
                      ) : null}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-neutral-subtle">
                      {inv.status === 'paid'
                        ? inv.paid_at
                          ? `Paid ${localDate(inv.paid_at)}`
                          : 'Paid'
                        : inv.due_date
                          ? `Due ${localDate(inv.due_date)}`
                          : ''}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="py-3">
                      <div className="flex justify-end gap-1">
                        {client.invoice && (
                          <Tooltip content="Invoice details">
                            <Button
                              iconOnly
                              size="sm"
                              variant="outline"
                              color="neutral"
                              onClick={() => setDetails(inv)}
                              aria-label={`Details of invoice ${inv.id}`}
                            >
                              <Icon iconName="file-lines" iconStyle="regular" />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip content="Download invoice">
                          <Button
                            iconOnly
                            size="sm"
                            variant="outline"
                            color="neutral"
                            disabled={!actions || downloading === inv.id || !!bulk}
                            loading={downloading === inv.id}
                            onClick={() => downloadOne(inv)}
                            aria-label={`Download invoice ${inv.id}`}
                          >
                            <Icon iconName="download" iconStyle="regular" />
                          </Button>
                        </Tooltip>
                        {inv.collectable && !aws && (
                          <Button
                            size="sm"
                            variant="outline"
                            color="neutral"
                            disabled={!actions || blocked || !!paying}
                            loading={paying === inv.id}
                            onClick={() => setConfirm(inv)}
                          >
                            {ps?.payment ? 'Retry payment' : 'Pay now'}
                          </Button>
                        )}
                      </div>
                      {ps?.error && (
                        <div
                          role="alert"
                          className="mt-2 flex flex-wrap items-center justify-end gap-2 text-sm text-negative"
                        >
                          <span>{ps.error}</span>
                          {ps.payment && (
                            <button
                              type="button"
                              className="font-medium text-brand hover:underline"
                              onClick={updateCard}
                            >
                              Update payment method
                            </button>
                          )}
                        </div>
                      )}
                    </TablePrimitives.Table.Cell>
                  </TablePrimitives.Table.Row>
                )
              })}
            </TablePrimitives.Table.Body>
          </TablePrimitives.Table.Root>
          {page.next_offset && (
            <div className="border-t border-neutral px-5 py-3 text-center">
              <Button
                size="md"
                variant="plain"
                color="neutral"
                loading={loadingMore}
                disabled={loadingMore}
                onClick={loadMore}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}

      {details && (
        <InvoiceDetailsModal
          organizationId={organizationId}
          client={client}
          invoice={details}
          onClose={() => setDetails(undefined)}
          onDownload={client.invoicePdf ? download : undefined}
          downloadAvailable={actions}
        />
      )}

      {confirm && (
        <Modal
          externalOpen
          setExternalOpen={(o) => {
            if (!o && !paying) setConfirm(undefined)
          }}
          width="min(480px, calc(100vw - 24px))"
        >
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1">
              <Dialog.Title asChild>
                <Heading level={2} className="pr-8">
                  Pay {amount(confirm.amount_due, confirm.currency)} now?
                </Heading>
              </Dialog.Title>
              <p className="text-sm text-neutral-subtle">
                The card on file will be charged {amount(confirm.amount_due, confirm.currency)} for invoice {confirm.id}
                , dated {localDate(confirm.date)}.
              </p>
            </div>
            {client.mode === 'preview' && (
              <Callout.Root color="sky">
                <Callout.Text>Preview: nothing is charged.</Callout.Text>
              </Callout.Root>
            )}
            <div className="flex justify-end gap-3">
              <Button
                size="lg"
                variant="plain"
                color="neutral"
                disabled={!!paying}
                onClick={() => setConfirm(undefined)}
              >
                Cancel
              </Button>
              <Button size="lg" loading={paying === confirm.id} disabled={!!paying} onClick={() => collect(confirm)}>
                Pay {amount(confirm.amount_due, confirm.currency)}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

const payBlocked = (ps?: PayState) => !!ps?.until && ps.until > Date.now()

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <ConsoleEmptyState icon="file-invoice" title={title} description={body}>
      {action && (
        <Button size="md" variant="outline" color="neutral" className="mt-2" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </ConsoleEmptyState>
  )
}

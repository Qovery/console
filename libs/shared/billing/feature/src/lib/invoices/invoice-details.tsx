import * as Dialog from '@radix-ui/react-dialog'
/*
 * An invoice in detail, opened from a row of <InvoicesPage>: the totals, every line as the customer
 * reads it (plan, add-on, usage, one-off charge), and under each usage line the usage it bills:
 * per day (a small chart and the table), per organization when the account has several, and the
 * builds per service for build and deployment minutes. It says when the record does not reach
 * back to the period. "Export CSV" saves the lines and the usage; "Download PDF" the invoice
 * itself when downloads are available. A read: it works when payments and downloads are not.
 */
import { Fragment, useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type {
  CustomerInvoice,
  InvoiceDetailLine,
  InvoiceDetails,
  InvoiceLineUsage,
  PricingClient,
} from '@qovery/shared/billing/data-access'
import { Badge, Button, Callout, Chart, Heading, Icon, Modal, TablePrimitives } from '@qovery/shared/ui'
import { ChartTooltip } from '../components/chart-tooltip'
import { errorText } from '../components/parts'
import { num } from '../utils/format'
import {
  amount,
  invoiceDetailsCSV,
  invoiceStatus,
  lineKindLabel,
  localDate,
  quantity,
  usageCoverageText,
  usageDays,
} from '../utils/rules'

const ORG_COLORS = [
  'var(--brand-9)',
  'var(--info-9)',
  'var(--positive-9)',
  'var(--warning-9)',
  'var(--accent-9, var(--neutral-9))',
  'var(--negative-9)',
]

export interface InvoiceDetailsModalProps {
  organizationId: string
  client: PricingClient
  invoice: CustomerInvoice
  onClose: () => void
  /** Downloads the PDF; absent or disabled when downloads are not available. */
  onDownload?: (inv: CustomerInvoice) => Promise<void>
  downloadAvailable: boolean
}

export function InvoiceDetailsModal({
  organizationId,
  client,
  invoice,
  onClose,
  onDownload,
  downloadAvailable,
}: InvoiceDetailsModalProps) {
  const [d, setD] = useState<InvoiceDetails>()
  const [error, setError] = useState('')
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const [downloading, setDownloading] = useState(false)
  useEffect(() => {
    let live = true
    client.invoice!(organizationId, invoice.id)
      .then((x) => {
        if (!live) return
        setD(x)
        // The first usage line opens on its own: it is what people come for.
        const first = x.lines.findIndex((l) => l.usage)
        if (first >= 0) setOpen({ [first]: true })
      })
      .catch((e) => live && setError(errorText(e)))
    return () => {
      live = false
    }
  }, [client, organizationId, invoice.id])

  function exportCSV() {
    if (!d) return
    const blob = new Blob([invoiceDetailsCSV(d)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `invoice-${d.id}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  async function download() {
    if (!onDownload) return
    setDownloading(true)
    try {
      await onDownload(invoice)
    } catch (e) {
      setError(`Download failed: ${errorText(e)}`)
    }
    setDownloading(false)
  }

  const st = invoiceStatus(invoice)
  const cur = d?.currency ?? invoice.currency
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) onClose()
      }}
      width="min(1040px, calc(100vw - 24px))"
    >
      <div className="flex max-h-[75vh] flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral px-5 pb-4 pt-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Dialog.Title asChild>
                <Heading level={2} className="break-all">
                  Invoice {invoice.id}
                </Heading>
              </Dialog.Title>
              <Badge className="font-medium" color={st.color} variant="surface" size="sm">
                {st.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-neutral-subtle">
              Dated {localDate(invoice.date)}
              {d?.period_from && d.period_to
                ? ` · Covers ${localDate(d.period_from)} to ${localDate(d.period_to)}`
                : ''}
              {invoice.status === 'paid' && invoice.paid_at
                ? ` · Paid ${localDate(invoice.paid_at)}`
                : invoice.due_date && invoice.collectable
                  ? ` · Due ${localDate(invoice.due_date)}`
                  : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pr-8">
            <Button size="md" variant="outline" color="neutral" disabled={!d} onClick={exportCSV}>
              <Icon iconName="file-csv" iconStyle="regular" />
              Export CSV
            </Button>
            <Button
              size="md"
              variant="outline"
              color="neutral"
              disabled={!downloadAvailable || !onDownload || downloading}
              loading={downloading}
              onClick={download}
              title={downloadAvailable ? undefined : 'Downloads are not available yet'}
            >
              <Icon iconName="download" iconStyle="regular" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          {error && (
            <Callout.Root color="red">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}
          {!d && !error && (
            <div className="h-48 animate-pulse rounded bg-surface-neutral-subtle" aria-label="Loading" />
          )}
          {d && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Stat label="Subtotal" value={amount(d.subtotal, cur)} />
                <Stat
                  label="Discounts"
                  value={d.discounts ? `−${amount(d.discounts, cur)}` : amount(0, cur)}
                  hint={d.discount_lines.map((x) => x.description).join(', ')}
                />
                <Stat label="Tax" value={amount(d.tax, cur)} />
                <Stat label="Total" value={amount(d.total, cur)} strong />
                <Stat
                  label={d.amount_due ? 'Due' : 'Paid'}
                  value={amount(d.amount_due || d.amount_paid, cur)}
                  tone={d.amount_due ? 'negative' : undefined}
                />
              </div>

              <section aria-label="Invoice lines" className="overflow-hidden rounded border border-neutral">
                <TablePrimitives.Table.Root containerClassName="rounded-none border-0" className="w-full text-sm">
                  <TablePrimitives.Table.Header className="bg-surface-neutral-subtle text-xs">
                    <TablePrimitives.Table.Row className="text-left text-neutral-subtle">
                      <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                        Description
                      </TablePrimitives.Table.ColumnHeaderCell>
                      <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                        Quantity
                      </TablePrimitives.Table.ColumnHeaderCell>
                      <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                        Unit price
                      </TablePrimitives.Table.ColumnHeaderCell>
                      <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                        Amount
                      </TablePrimitives.Table.ColumnHeaderCell>
                    </TablePrimitives.Table.Row>
                  </TablePrimitives.Table.Header>
                  <TablePrimitives.Table.Body className="divide-y divide-neutral">
                    {d.lines.length === 0 && (
                      <TablePrimitives.Table.Row>
                        <TablePrimitives.Table.Cell colSpan={4} className="py-6 text-center text-neutral-subtle">
                          This invoice has no line detail: the PDF shows what it bills.
                        </TablePrimitives.Table.Cell>
                      </TablePrimitives.Table.Row>
                    )}
                    {d.lines.map((l, i) => (
                      <Fragment key={i}>
                        <LineRow
                          line={l}
                          currency={cur}
                          open={!!open[i]}
                          onToggle={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                        />
                        {l.usage && open[i] && (
                          <TablePrimitives.Table.Row>
                            <TablePrimitives.Table.Cell colSpan={4} className="bg-surface-neutral-subtle py-4">
                              <UsageSection usage={l.usage} line={l} />
                            </TablePrimitives.Table.Cell>
                          </TablePrimitives.Table.Row>
                        )}
                      </Fragment>
                    ))}
                  </TablePrimitives.Table.Body>
                </TablePrimitives.Table.Root>
              </section>
              {d.notes.map((n) => (
                <p key={n} className="text-sm text-neutral-subtle">
                  {n}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

function Stat({
  label,
  value,
  hint,
  strong,
  tone,
}: {
  label: string
  value: string
  hint?: string
  strong?: boolean
  tone?: 'negative'
}) {
  return (
    <div className="rounded border border-neutral px-3 py-2" title={hint || undefined}>
      <div className="text-sm text-neutral-subtle">{label}</div>
      <div
        className={`text-sm ${strong ? 'font-medium' : 'font-medium'} ${tone === 'negative' ? 'text-negative' : 'text-neutral'}`}
      >
        {value}
      </div>
    </div>
  )
}

function LineRow({
  line: l,
  currency,
  open,
  onToggle,
}: {
  line: InvoiceDetailLine
  currency: string
  open: boolean
  onToggle: () => void
}) {
  const period =
    l.from && l.to && l.from !== l.to ? `${localDate(l.from)} to ${localDate(l.to)}` : l.from ? localDate(l.from) : ''
  return (
    <TablePrimitives.Table.Row className="align-top">
      <TablePrimitives.Table.Cell className="py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral">{l.label}</span>
          <Badge className="font-medium" color={l.kind === 'usage' ? 'sky' : 'neutral'} variant="surface" size="sm">
            {lineKindLabel(l.kind)}
          </Badge>
        </div>
        <div className="mt-0.5 text-sm text-neutral-subtle">
          {period}
          {l.description && l.description !== l.label ? `${period ? ' · ' : ''}${l.description}` : ''}
        </div>
        {l.usage && (
          <button
            type="button"
            className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            aria-expanded={open}
            onClick={onToggle}
          >
            <Icon iconName={open ? 'chevron-down' : 'chevron-right'} iconStyle="regular" className="text-xs" />
            {open ? 'Hide usage' : 'Usage'}
          </button>
        )}
      </TablePrimitives.Table.Cell>
      <TablePrimitives.Table.Cell className="whitespace-nowrap py-3 text-right text-neutral">
        {quantity(l.quantity, l.unit ?? '')}
      </TablePrimitives.Table.Cell>
      <TablePrimitives.Table.Cell className="whitespace-nowrap py-3 text-right text-neutral-subtle">
        {l.unit_price != null
          ? `${amount(l.unit_price, currency)}${l.unit ? ` / ${l.unit.replace(/s$/, '')}` : ''}`
          : '—'}
      </TablePrimitives.Table.Cell>
      <TablePrimitives.Table.Cell className="whitespace-nowrap py-3 text-right">
        <div className="font-medium text-neutral">{amount(l.net, currency)}</div>
        {l.discount > 0 && (
          <div className="text-sm text-neutral-subtle">
            {amount(l.amount, currency)} less {amount(l.discount, currency)}
          </div>
        )}
      </TablePrimitives.Table.Cell>
    </TablePrimitives.Table.Row>
  )
}

function UsageSection({ usage: u, line }: { usage: InvoiceLineUsage; line: InvoiceDetailLine }) {
  const coverage = usageCoverageText(u)
  const days = usageDays(u)
  const split = u.organizations.length > 1
  const unit = u.unit
  return (
    <section aria-label={`Usage behind ${line.label}`} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-neutral">
          {u.name}, {localDate(u.from)} to {localDate(u.to)}
        </h3>
        <span className="text-sm text-neutral-subtle">
          {u.source === 'billed' ? 'As recorded for billing' : 'From the deployment reports'}
        </span>
      </div>
      {coverage && (
        <Callout.Root color={u.available === 'none' ? 'neutral' : 'yellow'}>
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>{coverage}</Callout.Text>
        </Callout.Root>
      )}
      {u.available !== 'none' && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              label={u.aggregate === 'sum' ? 'Used in the period' : 'Unit-days in the period'}
              value={quantity(u.total, unit)}
            />
            <Stat label="Billed on this line" value={quantity(u.billed, unit)} strong />
            {u.not_billed != null && <Stat label="Not billed (plan or prepaid)" value={quantity(u.not_billed, unit)} />}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded border border-neutral bg-surface-neutral p-3">
              <div className="mb-1 text-sm text-neutral-subtle">Per day</div>
              <Chart.Container style={{ height: 180 }} isEmpty={!days.length}>
                <BarChart data={days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => num(v)} />
                  <Chart.Tooltip
                    content={
                      <ChartTooltip
                        title={u.name}
                        formatLabel={(k) => u.organizations.find((o) => o.organization_id === k)?.name ?? u.name}
                        formatValue={(v) => quantity(Number(v), unit)}
                      />
                    }
                  />
                  {split ? (
                    u.organizations.map((o, i) => (
                      <Bar
                        key={o.organization_id}
                        dataKey={o.organization_id}
                        name={o.organization_id}
                        stackId="o"
                        fill={ORG_COLORS[i % ORG_COLORS.length]}
                        isAnimationActive={false}
                      />
                    ))
                  ) : (
                    <Bar dataKey="quantity" name="quantity" fill={ORG_COLORS[0]} isAnimationActive={false} />
                  )}
                </BarChart>
              </Chart.Container>
              {split && (
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-neutral-subtle">
                  {u.organizations.map((o, i) => (
                    <span key={o.organization_id} className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ background: ORG_COLORS[i % ORG_COLORS.length] }} />
                      {o.name}: {quantity(o.quantity, unit)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="max-h-[260px] overflow-auto rounded border border-neutral bg-surface-neutral">
              <TablePrimitives.Table.Root containerClassName="rounded-none border-0" className="w-full text-sm">
                <TablePrimitives.Table.Header className="sticky top-0 bg-surface-neutral text-xs text-xs">
                  <TablePrimitives.Table.Row className="text-left text-neutral-subtle">
                    <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                      Day
                    </TablePrimitives.Table.ColumnHeaderCell>
                    {split &&
                      u.organizations.map((o) => (
                        <TablePrimitives.Table.ColumnHeaderCell
                          key={o.organization_id}
                          className="text-right font-normal"
                        >
                          {o.name}
                        </TablePrimitives.Table.ColumnHeaderCell>
                      ))}
                    <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                      {split ? 'Total' : 'Quantity'}
                    </TablePrimitives.Table.ColumnHeaderCell>
                  </TablePrimitives.Table.Row>
                </TablePrimitives.Table.Header>
                <TablePrimitives.Table.Body className="divide-y divide-neutral">
                  {u.days.map((x) => (
                    <TablePrimitives.Table.Row key={x.day}>
                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-neutral">
                        {localDate(x.day)}
                      </TablePrimitives.Table.Cell>
                      {split &&
                        u.organizations.map((o) => (
                          <TablePrimitives.Table.Cell
                            key={o.organization_id}
                            className="whitespace-nowrap text-right text-neutral-subtle"
                          >
                            {num(x.organizations?.[o.organization_id] ?? 0)}
                          </TablePrimitives.Table.Cell>
                        ))}
                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                        {quantity(x.quantity, unit)}
                      </TablePrimitives.Table.Cell>
                    </TablePrimitives.Table.Row>
                  ))}
                </TablePrimitives.Table.Body>
              </TablePrimitives.Table.Root>
            </div>
          </div>
        </>
      )}
      {u.builds && <BuildsTable builds={u.builds} several={split} />}
      {u.notes.map((n) => (
        <p key={n} className="text-sm text-neutral-subtle">
          {n}
        </p>
      ))}
    </section>
  )
}

function BuildsTable({ builds: b, several }: { builds: NonNullable<InvoiceLineUsage['builds']>; several: boolean }) {
  const min = (m: number) => `${(Math.round(m * 10) / 10).toLocaleString('en-US')} min`
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm text-neutral-subtle">Builds per service</h4>
        <span className="text-sm text-neutral-subtle">{b.note}</span>
      </div>
      {b.available !== 'complete' && (
        <Callout.Root color={b.available === 'none' ? 'neutral' : 'yellow'}>
          <Callout.Text>
            {b.available === 'none'
              ? 'Build details are unavailable for this period.'
              : b.since
                ? `Build details are available from ${localDate(b.since)}.`
                : 'Only part of this period has build details.'}
          </Callout.Text>
        </Callout.Root>
      )}
      {b.available !== 'none' && b.services.length > 0 && (
        <div className="max-h-[240px] overflow-auto rounded border border-neutral bg-surface-neutral">
          <TablePrimitives.Table.Root containerClassName="rounded-none border-0" className="w-full text-sm">
            <TablePrimitives.Table.Header className="sticky top-0 bg-surface-neutral text-xs text-xs">
              <TablePrimitives.Table.Row className="text-left text-neutral-subtle">
                <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                  Service
                </TablePrimitives.Table.ColumnHeaderCell>
                {several && (
                  <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                    Organization
                  </TablePrimitives.Table.ColumnHeaderCell>
                )}
                <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                  Builder
                </TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                  Builds
                </TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                  Build time
                </TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                  Counted
                </TablePrimitives.Table.ColumnHeaderCell>
                <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                  Deploy time
                </TablePrimitives.Table.ColumnHeaderCell>
              </TablePrimitives.Table.Row>
            </TablePrimitives.Table.Header>
            <TablePrimitives.Table.Body className="divide-y divide-neutral">
              {b.services.map((s, i) => (
                <TablePrimitives.Table.Row key={i}>
                  <TablePrimitives.Table.Cell className="text-neutral">
                    {s.name}
                    <span className="ml-1.5 text-neutral-subtle">{s.type.toLowerCase()}</span>
                  </TablePrimitives.Table.Cell>
                  {several && (
                    <TablePrimitives.Table.Cell className="text-neutral-subtle">
                      {s.organization}
                    </TablePrimitives.Table.Cell>
                  )}
                  <TablePrimitives.Table.Cell className="text-neutral-subtle">
                    {s.sizes.join(', ') || '—'}
                  </TablePrimitives.Table.Cell>
                  <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                    {num(s.builds)}
                    {s.failed_builds ? (
                      <span className="text-neutral-subtle"> ({num(s.failed_builds)} failed)</span>
                    ) : null}
                  </TablePrimitives.Table.Cell>
                  <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral-subtle">
                    {min(s.build_minutes)}
                  </TablePrimitives.Table.Cell>
                  <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                    {min(s.counted_build_minutes)}
                  </TablePrimitives.Table.Cell>
                  <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral-subtle">
                    {min(s.deploy_minutes)}
                  </TablePrimitives.Table.Cell>
                </TablePrimitives.Table.Row>
              ))}
            </TablePrimitives.Table.Body>
          </TablePrimitives.Table.Root>
        </div>
      )}
      {b.available !== 'none' && b.services.length === 0 && (
        <p className="text-sm text-neutral-subtle">No builds in the available data.</p>
      )}
    </div>
  )
}

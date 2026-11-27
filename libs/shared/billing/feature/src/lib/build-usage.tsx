import * as Dialog from '@radix-ui/react-dialog'
/*
 * Build usage over a period: build minutes by builder size (a bigger builder counts more per
 * minute), build against deploy time, the trend per day or month, what to optimize, then each
 * service (builds, minutes, average and p95 build time, builders used, cost, share, trend) with a
 * drill into its builds. Reads GET /organization/{id}/buildUsage; members see minutes, billing
 * roles also the costs. The back office passes its own `load` (staff endpoints, every field).
 *
 *   <BuildUsage organizationId={id} client={client} />
 */
import type { BuildServiceUsage, BuildUsageData, Granularity } from 'qovery-pricing-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import {
  Accordion,
  Badge,
  Button,
  Heading,
  Icon,
  InputText,
  Modal,
  Pagination,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { CompactSelect } from './compact-select'
import { errorText } from './parts'
import { money, num } from './utils/format'
import { quantity } from './utils/format'
import {
  BUILD_PRESETS,
  type BuildPreset,
  buildDuration,
  buildRange,
  buildServiceRows,
  buildSizeColor,
  customRangeError,
  granularityFor,
  periodLabel,
} from './utils/usage-rules'

export type BuildUsageLoader = (range: {
  from: string
  to: string
  granularity?: Granularity
  service?: string
}) => Promise<BuildUsageData>

export interface BuildUsageProps {
  organizationId: string
  client?: PricingClient
  /** Reads from another source (the back office's staff endpoints). */
  load?: BuildUsageLoader
  /** Staff wording and the organization column for an account's several organizations. */
  staff?: boolean
  view?: 'all' | 'summary' | 'services'
  periodRange?: { from: string; to: string; granularity: Granularity }
  embedded?: boolean
  today?: Date
}

function HintIcon({ kind }: { kind: string }) {
  const cls = `shrink-0 ${kind === 'failed' ? 'text-negative' : 'text-neutral-subtle'}`
  switch (kind) {
    case 'top_cost':
      return <Icon iconName="chart-pie" iconStyle="regular" className={cls} />
    case 'downsize':
      return <Icon iconName="arrow-down-short-wide" iconStyle="regular" className={cls} />
    case 'frequent':
      return <Icon iconName="repeat" iconStyle="regular" className={cls} />
    case 'failed':
      return <Icon iconName="triangle-exclamation" iconStyle="regular" className={cls} />
  }
  return <Icon iconName="lightbulb" iconStyle="regular" className={cls} />
}

function Tile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded border border-neutral p-4">
      <div className="text-sm text-neutral-subtle">{label}</div>
      <div className="text-sm font-medium text-neutral">{value}</div>
      {hint && <div className="text-sm text-neutral-subtle">{hint}</div>}
    </div>
  )
}

const minutes = (n: number) => quantity(n >= 100 ? Math.round(n) : Math.round(n * 10) / 10, 'minutes')
const pct = (x: number) => `${Math.round(x * 100)}%`
const when = (iso: string) =>
  `${new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })} UTC`

function BuildTableHeader({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <TablePrimitives.Table.ColumnHeaderCell className={`whitespace-nowrap font-normal ${right ? 'text-right' : ''}`}>
      {children}
    </TablePrimitives.Table.ColumnHeaderCell>
  )
}

export function BuildUsage({
  organizationId,
  client,
  load,
  staff,
  view = 'all',
  embedded = false,
  periodRange,
  today = new Date(),
}: BuildUsageProps) {
  const loader = useMemo<BuildUsageLoader | undefined>(
    () => load ?? (client?.buildUsage ? (r) => client.buildUsage!(organizationId, r) : undefined),
    [load, client, organizationId]
  )
  const [preset, setPreset] = useState<BuildPreset>('last_30')
  const [custom, setCustom] = useState(() => {
    const r = buildRange('last_3', today)
    return { from: r.from, to: r.to }
  })
  const [d, setD] = useState<BuildUsageData>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [ranking, setRanking] = useState<'counted_build_minutes' | 'deploy_minutes'>('counted_build_minutes')
  const [drill, setDrill] = useState<BuildServiceUsage>()
  const rangeError = !periodRange && preset === 'custom' ? customRangeError(custom.from, custom.to, today) : ''
  const localRange = useMemo(
    () =>
      preset === 'custom'
        ? { ...custom, granularity: granularityFor(custom.from, custom.to) }
        : buildRange(preset, today),
    [preset, custom.from, custom.to]
  )

  const range = periodRange ?? localRange

  useEffect(() => {
    if (!loader || rangeError) return
    let live = true
    setLoading(true)
    loader(range)
      .then((x) => {
        if (live) {
          setD(x)
          setError('')
        }
      })
      .catch((e) => live && setError(errorText(e)))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [organizationId, range.from, range.to, range.granularity, rangeError, load, client]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!loader) return null
  const amounts = !!d?.prices
  const cur = d?.currency ?? 'USD'
  const catalog = (d?.builder_sizes ?? []).map((s) => s.code)
  const sizeName = (code: string) =>
    d?.by_size.find((s) => s.size === code)?.name ?? d?.builder_sizes.find((s) => s.code === code)?.name ?? code
  const t = d?.totals
  const rows = d
    ? buildServiceRows(
        [...d.services],
        { q: '', type: '', size: '', built: ranking === 'counted_build_minutes' ? 'built' : 'all' },
        { key: ranking, desc: true }
      )
    : []
  const pageIndex = Math.min(page, Math.max(0, Math.ceil(rows.length / 10) - 1))
  const visibleRows = rows.slice(pageIndex * 10, (pageIndex + 1) * 10)
  const flush = view === 'services' || (embedded && view === 'summary')
  const multiOrg = staff && d?.organizations && Object.keys(d.organizations).length > 1

  return (
    <section
      className={`${embedded ? '' : 'overflow-hidden rounded border border-neutral bg-surface-neutral'} ${flush ? '' : 'p-4'}`}
      aria-label={view === 'services' ? 'Service usage' : 'Build and deploy usage'}
    >
      <div className={`flex flex-wrap items-center justify-between gap-3 ${flush ? 'p-4' : 'mb-4'}`}>
        <div className="flex flex-wrap items-center gap-1.5">
          <Heading level={3} className="text-sm font-medium text-neutral">
            {view === 'services' ? 'Services' : 'Build and deploy usage'}
          </Heading>
          {d?.source.note && (
            <Tooltip content={d.source.note} classNameContent="max-w-sm">
              <span tabIndex={0} aria-label="About usage data coverage" className="inline-flex">
                <Icon iconName="circle-info" iconStyle="regular" className="text-xs text-neutral-subtle" />
              </span>
            </Tooltip>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view !== 'summary' && (
            <CompactSelect
              ariaLabel="Rank services by"
              value={ranking}
              onChange={(value) => {
                setRanking(value as typeof ranking)
                setPage(0)
              }}
              options={[
                { value: 'counted_build_minutes', label: 'Build minutes' },
                { value: 'deploy_minutes', label: 'Deploy minutes' },
              ]}
            />
          )}
          {!periodRange && (
            <CompactSelect
              ariaLabel="Period"
              value={preset}
              onChange={(v) => {
                setPreset(v as BuildPreset)
                setPage(0)
              }}
              options={BUILD_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
            />
          )}
        </div>
      </div>
      {!periodRange && preset === 'custom' && (
        <div
          className={`mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[200px_200px_1fr] ${view === 'services' ? 'px-4' : ''}`}
        >
          <InputText
            name="builds_from"
            label="From"
            type="date"
            value={custom.from}
            onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
          />
          <InputText
            name="builds_to"
            label="To"
            type="date"
            value={custom.to}
            onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
          />
          <p className="self-center text-sm text-neutral-subtle">{rangeError || 'Up to 24 months.'}</p>
        </div>
      )}
      {error && (
        <p role="alert" className={`mb-3 text-sm text-negative ${view === 'services' ? 'px-4' : ''}`}>
          {error}
        </p>
      )}
      {!d && !error && (
        <div className="h-[320px] animate-pulse rounded bg-surface-neutral-subtle" aria-label="Loading" />
      )}
      {d && t && (
        <div className={`flex flex-col gap-4 ${loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
          {t.deployments === 0 && t.builds === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-subtle">
              No build or deployment reported in this period.
            </p>
          ) : (
            <>
              {view !== 'services' && (
                <>
                  <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${flush ? 'px-4' : ''}`}>
                    <Tile
                      label="Build minutes"
                      value={minutes(t.counted_build_minutes)}
                      hint={
                        <>
                          {amounts && <span>{money(t.build_cost ?? 0, cur)}</span>}
                          {t.build_minutes !== t.counted_build_minutes && (
                            <span className="block">{num(t.build_minutes)} min run</span>
                          )}
                        </>
                      }
                    />
                    <Tile
                      label="Deploy minutes"
                      value={minutes(t.deploy_minutes)}
                      hint={amounts ? money(t.deploy_cost ?? 0, cur) : undefined}
                    />
                    <Tile
                      label="Builds"
                      value={num(t.builds)}
                      hint={
                        t.failed_builds
                          ? `${num(t.failed_builds)} failed, ${minutes(t.failed_counted_minutes)}`
                          : 'none failed'
                      }
                    />
                  </div>

                  <Accordion.Root type="single" collapsible className="border-t border-neutral">
                    <Accordion.Item value="breakdown">
                      <Accordion.Trigger
                        className={`min-h-12 w-full cursor-pointer justify-between gap-3 py-3 text-left font-medium ${flush ? 'px-4' : 'px-0'}`}
                        iconClassName="order-2 ml-auto"
                      >
                        Builder breakdown and optimization
                      </Accordion.Trigger>
                      <Accordion.Content className="border-t border-neutral">
                        <div className={`flex flex-col gap-4 py-4 ${flush ? 'px-4' : ''}`}>
                          <div>
                            <Heading level={3} className="mb-2 text-sm font-medium text-neutral">
                              By builder size
                            </Heading>
                            <div className="overflow-auto rounded border border-neutral">
                              <TablePrimitives.Table.Root
                                containerClassName="rounded-none border-0"
                                className="w-full text-sm"
                              >
                                <TablePrimitives.Table.Header className="text-xs">
                                  <TablePrimitives.Table.Row className="text-left text-neutral-subtle">
                                    <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                                      Builder
                                    </TablePrimitives.Table.ColumnHeaderCell>
                                    <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                                      Builds
                                    </TablePrimitives.Table.ColumnHeaderCell>
                                    <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                                      Run
                                    </TablePrimitives.Table.ColumnHeaderCell>
                                    <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                                      Counted
                                    </TablePrimitives.Table.ColumnHeaderCell>
                                    {amounts && (
                                      <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                                        Cost
                                      </TablePrimitives.Table.ColumnHeaderCell>
                                    )}
                                    <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                                      Share
                                    </TablePrimitives.Table.ColumnHeaderCell>
                                  </TablePrimitives.Table.Row>
                                </TablePrimitives.Table.Header>
                                <TablePrimitives.Table.Body className="divide-y divide-neutral">
                                  {d.by_size.map((s) => (
                                    <TablePrimitives.Table.Row key={s.size}>
                                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-neutral">
                                        <span
                                          className="mr-2 inline-block h-2 w-2 rounded-sm"
                                          style={{ background: buildSizeColor(s.size, catalog) }}
                                        />
                                        {s.name}
                                        <span className="ml-1 text-sm text-neutral-subtle">×{s.multiplier}</span>
                                        {(s.unknown || s.no_builder) && (
                                          <span className="ml-2 text-sm text-neutral-subtle">
                                            {s.unknown ? 'counted as Standard' : 'counts once'}
                                          </span>
                                        )}
                                      </TablePrimitives.Table.Cell>
                                      <TablePrimitives.Table.Cell className="text-right text-neutral">
                                        {num(s.builds)}
                                      </TablePrimitives.Table.Cell>
                                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral-subtle">
                                        {num(s.build_minutes)} min
                                      </TablePrimitives.Table.Cell>
                                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                                        {num(s.counted_build_minutes)} min
                                      </TablePrimitives.Table.Cell>
                                      {amounts && (
                                        <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                                          {money(s.cost ?? 0, cur)}
                                        </TablePrimitives.Table.Cell>
                                      )}
                                      <TablePrimitives.Table.Cell className="w-28 ">
                                        <div className="flex items-center gap-2">
                                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-neutral-component">
                                            <div
                                              className="h-full rounded-full"
                                              style={{
                                                width: pct(s.share),
                                                background: buildSizeColor(s.size, catalog),
                                              }}
                                            />
                                          </div>
                                          <span className="w-8 text-right text-sm text-neutral-subtle">
                                            {pct(s.share)}
                                          </span>
                                        </div>
                                      </TablePrimitives.Table.Cell>
                                    </TablePrimitives.Table.Row>
                                  ))}
                                </TablePrimitives.Table.Body>
                              </TablePrimitives.Table.Root>
                            </div>
                          </div>
                          <div>
                            <Heading level={3} className="mb-2 text-sm font-medium text-neutral">
                              What to optimize
                            </Heading>
                            {d.hints.length === 0 ? (
                              <p className="rounded border border-neutral px-3 py-4 text-sm text-neutral-subtle">
                                Nothing stands out in this period.
                              </p>
                            ) : (
                              <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                                {d.hints.slice(0, 6).map((h, i) => {
                                  const service = d.services.find((s) => s.service_id === h.service_id)
                                  const title = h.kind === 'failed' ? `Failed builds · ${h.service_name}` : h.title
                                  const detail =
                                    h.kind === 'failed' && service
                                      ? `${num(service.failed_builds)} of ${num(service.builds)} builds failed · ${minutes(h.minutes)}${amounts && h.cost != null ? ` · ${money(h.cost, cur)}` : ''}`
                                      : h.detail
                                  return (
                                    <li key={i}>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        color="neutral"
                                        className="h-full w-full items-center justify-start gap-3 whitespace-normal p-4 text-left font-normal"
                                        disabled={!service}
                                        onClick={() => setDrill(service)}
                                      >
                                        <HintIcon kind={h.kind} />
                                        <span className="min-w-0 flex-1">
                                          <span className="flex flex-wrap items-baseline justify-between gap-2">
                                            <span className="text-sm font-medium text-neutral">{title}</span>
                                            {h.kind !== 'failed' && amounts && h.cost != null && (
                                              <span className="text-sm text-neutral-subtle">{money(h.cost, cur)}</span>
                                            )}
                                          </span>
                                          <span className="block text-sm text-neutral-subtle">{detail}</span>
                                        </span>
                                      </Button>
                                    </li>
                                  )
                                })}
                              </ul>
                            )}
                          </div>
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </>
              )}
              {view !== 'summary' && (
                <div>
                  <div
                    className={
                      view === 'services'
                        ? 'overflow-auto border-t border-neutral'
                        : 'overflow-auto rounded border border-neutral'
                    }
                  >
                    <TablePrimitives.Table.Root containerClassName="rounded-none border-0" className="w-full text-sm">
                      <TablePrimitives.Table.Header className="bg-surface-neutral text-xs">
                        <TablePrimitives.Table.Row className="text-left text-neutral-subtle">
                          <BuildTableHeader>Service</BuildTableHeader>
                          {multiOrg && <BuildTableHeader>Organization</BuildTableHeader>}
                          <BuildTableHeader right>Builds</BuildTableHeader>
                          <BuildTableHeader right>Build min</BuildTableHeader>
                          <BuildTableHeader right>Deploy min</BuildTableHeader>
                          <BuildTableHeader>Builder</BuildTableHeader>
                          {amounts && <BuildTableHeader right>Cost</BuildTableHeader>}
                        </TablePrimitives.Table.Row>
                      </TablePrimitives.Table.Header>
                      <TablePrimitives.Table.Body className="divide-y divide-neutral">
                        {rows.length === 0 && (
                          <TablePrimitives.Table.Row>
                            <TablePrimitives.Table.Cell
                              colSpan={4 + Number(!!multiOrg) + Number(amounts) + 1}
                              className="py-6 text-center text-sm text-neutral-subtle"
                            >
                              No service usage recorded in this period.
                            </TablePrimitives.Table.Cell>
                          </TablePrimitives.Table.Row>
                        )}
                        {visibleRows.map((s) => (
                          <TablePrimitives.Table.Row
                            key={s.organization_id + s.service_id}
                            className="cursor-pointer hover:bg-surface-neutral-subtle"
                            onClick={() => setDrill(s)}
                          >
                            <TablePrimitives.Table.Cell className="max-w-[240px] py-2">
                              <Button
                                size="sm"
                                variant="plain"
                                color="neutral"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setDrill(s)
                                }}
                                className={`max-w-full justify-start px-0 font-medium ${s.service_id ? 'text-neutral' : 'text-neutral-subtle'}`}
                              >
                                <span className="truncate">{s.name}</span>
                              </Button>
                              <div className="text-sm text-neutral-subtle">
                                {s.type
                                  ? s.type.charAt(0) + s.type.slice(1).toLowerCase()
                                  : 'Time no service accounts for'}
                                {s.failed_builds ? ` · ${s.failed_builds} failed` : ''}
                              </div>
                            </TablePrimitives.Table.Cell>
                            {multiOrg && (
                              <TablePrimitives.Table.Cell className="whitespace-nowrap text-neutral-subtle">
                                {d.organizations?.[s.organization_id] ?? s.organization_id}
                              </TablePrimitives.Table.Cell>
                            )}
                            <TablePrimitives.Table.Cell className="text-right text-neutral">
                              {s.builds ? num(s.builds) : '—'}
                            </TablePrimitives.Table.Cell>
                            <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                              {s.builds ? num(s.counted_build_minutes) : '—'}
                              {s.builds > 0 && s.counted_build_minutes !== s.build_minutes && (
                                <div className="text-sm text-neutral-subtle">{num(s.build_minutes)} run</div>
                              )}
                            </TablePrimitives.Table.Cell>
                            <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                              {num(s.deploy_minutes)}
                            </TablePrimitives.Table.Cell>
                            <TablePrimitives.Table.Cell className="">
                              <div className="flex flex-wrap gap-1">
                                {s.sizes.map((z) => (
                                  <Badge className="font-medium" key={z} color="neutral" variant="surface" size="sm">
                                    <span
                                      className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                                      style={{ background: buildSizeColor(z, catalog) }}
                                    />
                                    {sizeName(z)}
                                  </Badge>
                                ))}
                              </div>
                            </TablePrimitives.Table.Cell>
                            {amounts && (
                              <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                                {money(s.cost ?? 0, cur)}
                              </TablePrimitives.Table.Cell>
                            )}
                          </TablePrimitives.Table.Row>
                        ))}
                      </TablePrimitives.Table.Body>
                    </TablePrimitives.Table.Root>
                  </div>
                  {rows.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral p-4">
                      <p className="text-sm text-neutral-subtle">
                        {pageIndex * 10 + 1}–{Math.min((pageIndex + 1) * 10, rows.length)} of {rows.length} services
                      </p>
                      <Pagination
                        hidePageSize
                        previousDisabled={pageIndex === 0}
                        nextDisabled={(pageIndex + 1) * 10 >= rows.length}
                        onPrevious={() => setPage(pageIndex - 1)}
                        onNext={() => setPage(pageIndex + 1)}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {drill && d && !rangeError && (
        <BuildDrill
          service={d.services.find((service) => service.service_id === drill.service_id) ?? drill}
          load={loader}
          range={range}
          data={d}
          amounts={amounts}
          onClose={() => setDrill(undefined)}
        />
      )}
    </section>
  )
}

function BuildDrill({
  service,
  load,
  range,
  data,
  amounts,
  onClose,
}: {
  service: BuildServiceUsage
  load: BuildUsageLoader
  range: { from: string; to: string; granularity: Granularity }
  data: BuildUsageData
  amounts: boolean
  onClose: () => void
}) {
  const [rows, setRows] = useState<BuildUsageData['builds']>()
  const [error, setError] = useState('')
  useEffect(() => {
    let live = true
    setRows(undefined)
    setError('')
    load({ ...range, service: service.service_id })
      .then((x) => live && setRows(x.builds ?? []))
      .catch((e) => live && setError(errorText(e)))
    return () => {
      live = false
    }
  }, [load, range, service.service_id])
  const cur = data.currency
  const catalog = data.builder_sizes.map((s) => s.code)
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) onClose()
      }}
      width="min(980px, calc(100vw - 24px))"
    >
      <div className="p-5">
        <Dialog.Title asChild>
          <Heading level={2} className="break-words pr-8">
            {service.name}
          </Heading>
        </Dialog.Title>
        <p className="mb-4 mt-1 text-sm text-neutral-subtle">
          {periodLabel(range.from, true)} to {periodLabel(range.to, true)} · {num(service.builds)} builds,{' '}
          {minutes(service.counted_build_minutes)} counted
          {amounts && service.cost != null ? `, ${money(service.cost, cur)}` : ''}
          {service.builds
            ? ` · average ${buildDuration(service.avg_build_seconds)} · p95 ${buildDuration(service.p95_build_seconds)} · ${pct(service.share)} of build usage`
            : ''}
        </p>
        {error && (
          <p role="alert" className="text-sm text-negative">
            {error}
          </p>
        )}
        {!rows && !error && (
          <div className="h-40 animate-pulse rounded bg-surface-neutral-subtle" aria-label="Loading" />
        )}
        {rows && (
          <div className="max-h-[60vh] overflow-auto rounded border border-neutral">
            <TablePrimitives.Table.Root containerClassName="rounded-none border-0" className="w-full text-sm">
              <TablePrimitives.Table.Header className="sticky top-0 bg-surface-neutral text-xs">
                <TablePrimitives.Table.Row className="text-left text-neutral-subtle">
                  <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                    Finished
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                    Status
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                    Build
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                    Deploy
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                    Builder
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                    Counted
                  </TablePrimitives.Table.ColumnHeaderCell>
                  {amounts && (
                    <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                      Cost
                    </TablePrimitives.Table.ColumnHeaderCell>
                  )}
                </TablePrimitives.Table.Row>
              </TablePrimitives.Table.Header>
              <TablePrimitives.Table.Body className="divide-y divide-neutral">
                {rows.length === 0 && (
                  <TablePrimitives.Table.Row>
                    <TablePrimitives.Table.Cell colSpan={7} className="py-6 text-center text-neutral-subtle">
                      No build in this period.
                    </TablePrimitives.Table.Cell>
                  </TablePrimitives.Table.Row>
                )}
                {rows.map((b) => (
                  <TablePrimitives.Table.Row key={b.execution_id}>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-neutral">
                      {when(b.finished_at)}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="">
                      <Badge className="font-medium" color={b.failed ? 'red' : 'green'} variant="surface" size="sm">
                        {b.failed ? 'Failed' : 'Succeeded'}
                      </Badge>
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                      {b.build_seconds ? buildDuration(b.build_seconds) : '—'}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral-subtle">
                      {b.deploy_seconds ? buildDuration(b.deploy_seconds) : '—'}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-neutral">
                      <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-sm"
                        style={{ background: buildSizeColor(b.size, catalog) }}
                      />
                      {b.size_name}
                      {b.cpu_milli != null && (
                        <span className="ml-1 text-sm text-neutral-subtle">
                          {b.cpu_milli / 1000} vCPU{b.ram_gib != null ? `, ${b.ram_gib} GiB` : ''}
                        </span>
                      )}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                      {b.build_seconds ? `${b.counted_build_minutes} min` : '—'}
                    </TablePrimitives.Table.Cell>
                    {amounts && (
                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                        {money(b.cost ?? 0, cur)}
                      </TablePrimitives.Table.Cell>
                    )}
                  </TablePrimitives.Table.Row>
                ))}
              </TablePrimitives.Table.Body>
            </TablePrimitives.Table.Root>
          </div>
        )}
        {rows && rows.length >= 500 && (
          <p className="mt-2 text-sm text-neutral-subtle">
            The latest 500 builds. Pick a shorter period to see the others.
          </p>
        )}
      </div>
    </Modal>
  )
}

/*
 * The console's plan and usage page, from pricing-api's billingUsage: the plan, the current bill and
 * this month's spend (billing roles), banners, usage against every limit with its three-month chart,
 * the features included, and usage over time (UsageInsights). Read-only: plan changes need core's
 * planOptions and planChange routes, which do not exist yet.
 *
 *   <BillingPage usage={billingUsage} />
 */
import { type ReactNode, useState } from 'react'
import { Callout, Icon, Modal } from '@qovery/shared/ui'
import { date, money, num, valueText } from './format'
import { type BillingUsage, type Entitlement, type UsageSeries } from './types'
import { UsageChart, UsageInsights } from './usage-insights'

export interface BillingPageProps {
  usage: BillingUsage
}

function Card({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="min-h-[114px] flex-1 rounded border border-neutral bg-surface-neutral p-5">
      <div className="mb-1 text-xs font-medium text-neutral-subtle">{label}</div>
      <div className="mb-1 text-sm font-medium text-neutral">{children}</div>
      {hint && <div className="text-xs text-neutral-subtle">{hint}</div>}
    </div>
  )
}

function UsageBar({ used, value, over }: { used: number; value: number; over: boolean }) {
  const pct = value > 0 ? Math.min(100, (used / value) * 100) : used > 0 ? 100 : 0
  const color = over ? 'var(--negative-9)' : pct >= 80 ? 'var(--warning-9)' : 'var(--brand-9)'
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-neutral-component">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

// Settings measured in days (log retention) are a value, not a usage.
const isSetting = (e: Entitlement) => e.unit === 'days'

function UsageRow({ e, onDetails }: { e: Entitlement; onDetails?: () => void }) {
  const finite = typeof e.value === 'number' && !isSetting(e)
  return (
    <div className="flex flex-col gap-2 px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-neutral">{e.name}</span>
          {e.kind === 'meter' && <span className="ml-2 text-xs text-neutral-subtle">this month</span>}
        </div>
        <div className="text-sm text-neutral">
          {isSetting(e) ? (
            <span>{valueText(e.value, e.unit)}</span>
          ) : (
            <>
              <span className={e.over ? 'font-medium text-negative' : ''}>{num(e.used)}</span>
              <span className="text-neutral-subtle">
                {' '}
                / {valueText(e.value)}
                {e.unit && finite ? ` ${e.unit}` : ''}
              </span>
            </>
          )}
        </div>
      </div>
      {finite && <UsageBar used={e.used} value={e.value as number} over={e.over} />}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-subtle">
        <span>
          {e.customer_note}
          {e.prepaid ? ` · ${num(e.prepaid)} prepaid` : ''}
          {e.mode === 'soft' && e.overage_unit_price > 0
            ? ` · then ${money(e.overage_unit_price)} per ${e.unit.replace(/s$/, '')}`
            : ''}
        </span>
        <span className="flex items-center gap-3">
          {onDetails && (
            <button type="button" className="font-medium text-brand hover:underline" onClick={onDetails}>
              View usage
            </button>
          )}
          {e.over && e.mode === 'soft' && <span className="text-warning">Billed above the plan</span>}
        </span>
      </div>
    </div>
  )
}

function SeriesModal({ series, onClose }: { series: UsageSeries; onClose: () => void }) {
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) onClose()
      }}
      width="min(860px, calc(100vw - 24px))"
    >
      <div className="p-6">
        <h2 className="h4 text-neutral">{series.name}</h2>
        <p className="mb-4 text-sm text-neutral-subtle">
          {series.kind === 'meter'
            ? 'Consumed per day and month to date, over three months.'
            : 'In use each day, over three months.'}
          {series.included != null
            ? ` ${series.included.toLocaleString('en-US')} ${series.unit} included${series.kind === 'meter' ? ' per month' : ''}.`
            : ''}
        </p>
        <UsageChart series={series} height={280} />
      </div>
    </Modal>
  )
}

export function BillingPage({ usage: u }: BillingPageProps) {
  const [detail, setDetail] = useState<UsageSeries>()
  const cur = u.billing.currency
  const amounts = u.access !== 'member'
  // A limit the plan does not include (0, nothing used) reads as "not included", with the features.
  const notIncluded = (e: Entitlement) => e.kind !== 'feature' && e.value === 0 && e.used === 0
  const limits = u.entitlements.filter((e) => e.kind !== 'feature' && e.lifecycle !== 'preview' && !notIncluded(e))
  const features = u.entitlements
    .filter((e) => e.kind === 'feature' || notIncluded(e))
    .map((e) => (e.kind === 'feature' ? e : { ...e, value: false as const }))
  const sp = u.spend
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-neutral pb-5">
        <h2 className="h4 text-neutral">Plan details</h2>
        <p className="text-sm text-neutral-subtle">
          Your plan, what it includes and what you use. Limits are shared by every organization of your contract.
        </p>
      </div>
      {u.status.status === 'payment_failed' && (
        <Callout.Root color="red">
          <Callout.Text>
            <Callout.TextHeading>Your last payment failed</Callout.TextHeading>
            {u.status.message ?? 'Update your payment method'}
            {u.status.grace_until ? ` before ${date(u.status.grace_until)} to keep creating resources.` : '.'}
          </Callout.Text>
        </Callout.Root>
      )}
      {u.billing.locked && (
        <Callout.Root color="red">
          <Callout.Text>
            <Callout.TextHeading>New resources are paused</Callout.TextHeading>Your subscription is paused, cancelled or
            unpaid. Running services are not affected.
          </Callout.Text>
        </Callout.Root>
      )}
      {u.billing.phase && (
        <Callout.Root color="sky">
          <Callout.Text>
            <Callout.TextHeading>
              {u.billing.phase.kind === 'poc' ? 'Proof of concept' : 'Trial'} until {date(u.billing.phase.until)}
            </Callout.TextHeading>
            Limits are not enforced until then.
          </Callout.Text>
        </Callout.Root>
      )}

      <div className="flex flex-col gap-2 md:flex-row">
        <Card
          label="Current plan"
          hint={`${u.billing.period === 'year' ? 'Yearly' : 'Monthly'} · term ends ${date(u.billing.term_end)}`}
        >
          {u.plan.name}
        </Card>
        {amounts && u.estimate && (
          <Card label="Current bill" hint={`Next invoice: ${date(u.estimate.term_end || u.billing.term_end)}`}>
            {money(u.estimate.total, cur)}{' '}
            <span className="text-xs font-normal text-neutral-subtle">/ {u.estimate.period}</span>
          </Card>
        )}
        {amounts && sp && (
          <Card
            label="Spend this month"
            hint={
              sp.account.monthly_limit != null
                ? `${Math.round(sp.account.used_pct ?? 0)}% of the ${money(sp.account.monthly_limit, cur)} limit`
                : 'No spend limit'
            }
          >
            {money(sp.spent, cur)} <span className="text-xs font-normal text-neutral-subtle">beyond the plan</span>
          </Card>
        )}
      </div>

      {amounts && u.estimate && u.estimate.lines.length > 1 && (
        <div className="rounded border border-neutral bg-surface-neutral">
          {u.estimate.lines.map((l, i) => (
            <div
              key={i}
              className="flex justify-between gap-3 border-b border-neutral px-5 py-2 text-sm last:border-b-0"
            >
              <span className="text-neutral">
                {l.label}
                {l.quantity > 1 ? ` × ${l.quantity}` : ''}
              </span>
              <span className={l.amount < 0 ? 'text-positive' : 'text-neutral'}>{money(l.amount, cur)}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-base font-medium text-neutral">Usage</h3>
        <div className="divide-y divide-neutral rounded border border-neutral bg-surface-neutral">
          {limits.map((e) => {
            const series = u.usage_insights?.series.find((x) => x.sku === e.sku)
            return <UsageRow key={e.sku} e={e} onDetails={series ? () => setDetail(series) : undefined} />
          })}
        </div>
        {features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {features.map((f) => (
              <span
                key={f.sku}
                className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 ${f.value === true ? 'border-neutral text-neutral' : 'border-neutral text-neutral-subtle'}`}
              >
                <Icon
                  iconName={f.value === true ? 'check' : 'lock'}
                  iconStyle="regular"
                  className={f.value === true ? 'text-positive' : ''}
                />
                {f.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-base font-medium text-neutral">Usage details</h3>
        <p className="mb-3 text-sm text-neutral-subtle">
          How this organization used the plan over the last three months, and where this month is heading.
        </p>
        <UsageInsights usage={u} />
      </div>

      {u.notes.length > 0 && <p className="text-xs text-neutral-subtle">{u.notes.join(' ')}</p>}

      {detail && <SeriesModal series={detail} onClose={() => setDetail(undefined)} />}
    </div>
  )
}

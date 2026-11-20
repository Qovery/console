/*
 * <BillingPage>: the three billing pages in one, with tabs (Usage, Invoices, Billing), for hosts
 * that show billing on one route (the back office's customer view). The console mounts the three
 * pages on their own sidebar entries instead: <UsagePage>, <InvoicesPage>, <BillingSettingsPage>.
 *
 *   <BillingPage organizationId={id} client={createPricingClient({ pricingApiUrl, getToken })} />
 */
import { useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { BillingSettingsPage } from './billing-settings-page'
import { InvoicesPage } from './invoices-page'
import { UsagePage, type UsagePageProps } from './usage-page'

export type BillingTab = 'usage' | 'invoices' | 'billing'

export interface BillingPageProps extends UsagePageProps {
  /** The tab shown first (default: usage). */
  tab?: BillingTab
  /** Called when the tab changes, to keep it in the URL. */
  onTabChange?: (tab: BillingTab) => void
}

const TABS: { id: BillingTab; label: string }[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'billing', label: 'Billing' },
]

export function BillingPage({ tab: initial = 'usage', onTabChange, ...props }: BillingPageProps) {
  const [tab, setTab] = useState<BillingTab>(initial)
  const go = (t: BillingTab) => {
    setTab(t)
    onTabChange?.(t)
  }
  return (
    <div className="flex flex-col gap-6">
      <nav role="tablist" aria-label="Billing" className="flex gap-1 overflow-x-auto border-b border-neutral">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => go(t.id)}
            className={twMerge(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-brand-strong text-neutral'
                : 'border-transparent text-neutral-subtle hover:text-neutral'
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'usage' && <UsagePage {...props} onNavigate={go} />}
      {tab === 'invoices' && (
        <InvoicesPage
          organizationId={props.organizationId}
          client={props.client}
          onManagePaymentMethod={() => go('billing')}
          onNavigate={go}
        />
      )}
      {tab === 'billing' && (
        <BillingSettingsPage organizationId={props.organizationId} client={props.client} onNavigate={go} />
      )}
    </div>
  )
}

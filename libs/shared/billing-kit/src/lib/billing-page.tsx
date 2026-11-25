/*
 * <BillingPage>: the three billing pages in one, with tabs (Usage, Invoices, Billing), for hosts
 * that show billing on one route (the back office's customer view). The console mounts the three
 * pages on their own sidebar entries instead: <UsagePage>, <InvoicesPage>, <BillingSettingsPage>.
 *
 *   <BillingPage organizationId={id} client={createPricingClient({ pricingApiUrl, getToken })} />
 */
import { type MutableRefObject, useEffect, useRef, useState } from 'react'
import { TabsPrimitives } from '@qovery/shared/ui'
import { BillingSettingsPage } from './billing-settings-page'
import { InvoicesPage } from './invoices-page'
import { UsagePage, type UsagePageProps } from './usage-page'

const { Tabs } = TabsPrimitives

export type BillingTab = 'usage' | 'invoices' | 'billing'

export interface BillingPageProps extends UsagePageProps {
  /** The active tab when controlled (defaults to Usage when omitted). */
  tab?: BillingTab
  /** Called when the tab changes, to keep it in the URL. */
  onTabChange?: (tab: BillingTab) => void
}

const TABS: { id: BillingTab; label: string }[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'billing', label: 'Billing' },
]

function UsageTab({ initialJourney, ...props }: UsagePageProps & { initialJourney: MutableRefObject<boolean> }) {
  const open = initialJourney.current ? undefined : props.open
  useEffect(() => {
    initialJourney.current = true
  }, [initialJourney])
  return <UsagePage {...props} open={open} />
}

export function BillingPage(props: BillingPageProps) {
  return <BillingTabs key={props.organizationId} {...props} />
}

function BillingTabs({ tab, onTabChange, ...props }: BillingPageProps) {
  const [selectedTab, setSelectedTab] = useState('usage')
  const initialJourney = useRef(false)
  const go = (value: string) => {
    const next = TABS.find((item) => item.id === value)?.id
    if (!next) return
    setSelectedTab(next)
    onTabChange?.(next)
  }
  return (
    <Tabs.Root value={tab ?? selectedTab} onValueChange={go} className="flex flex-col gap-6">
      <Tabs.List aria-label="Billing" className="border-b border-neutral">
        {TABS.map(({ id, label }) => (
          <Tabs.Trigger key={id} value={id}>
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value="usage">
        <UsageTab {...props} onNavigate={go} initialJourney={initialJourney} />
      </Tabs.Content>
      <Tabs.Content value="invoices">
        <InvoicesPage
          organizationId={props.organizationId}
          client={props.client}
          onManagePaymentMethod={() => go('billing')}
          onNavigate={go}
        />
      </Tabs.Content>
      <Tabs.Content value="billing">
        <BillingSettingsPage organizationId={props.organizationId} client={props.client} onNavigate={go} />
      </Tabs.Content>
    </Tabs.Root>
  )
}

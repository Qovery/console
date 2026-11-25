import { useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { P, match } from 'ts-pattern'
import { UsagePage, type UsagePageHeading } from '@qovery/shared/billing-kit'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Callout, EmptyState, Icon, Link, Section, Skeleton } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import {
  type BillingUsageErrorType,
  getBillingUsageErrorType,
  useBillingUsage,
} from '../hooks/use-billing-usage/use-billing-usage'
import { usePricingClient } from '../hooks/use-pricing-client/use-pricing-client'
import { SettingsBillingSummary } from '../settings-billing-summary/settings-billing-summary'

export const BILLING_USAGE_FEATURE_FLAG = 'billing-usage-v2'

export function useIsBillingUsageEnabled() {
  return useFeatureFlagEnabled(BILLING_USAGE_FEATURE_FLAG) === true
}

const BILLING_ROLES = ['owner', 'admin', 'billing']

// UX only: pricing-api decides who reads invoices and payment details
export function hasBillingRole(roles: string[], organizationId: string) {
  return (
    roles.includes('admin') || BILLING_ROLES.some((role) => roles.includes(`organization:${organizationId}:${role}`))
  )
}

export function getBillingSettingsLinks(
  pathSettings: string,
  isBillingUsageEnabled: boolean,
  canManageBilling = false
) {
  if (!isBillingUsageEnabled) {
    return [
      { title: 'Billing summary', to: `${pathSettings}/billing-summary` },
      { title: 'Billing details', to: `${pathSettings}/billing-details` },
    ]
  }

  return [
    { title: 'Usage', to: `${pathSettings}/billing` },
    ...(canManageBilling
      ? [
          { title: 'Invoices', to: `${pathSettings}/invoices` },
          { title: 'Billing', to: `${pathSettings}/billing-settings` },
        ]
      : []),
  ]
}

export function useBillingNavigate(organizationId: string) {
  const navigate = useNavigate()

  return useCallback(
    (to: 'invoices' | 'billing') =>
      to === 'invoices'
        ? navigate({ to: '/organization/$organizationId/settings/invoices', params: { organizationId } })
        : navigate({ to: '/organization/$organizationId/settings/billing-settings', params: { organizationId } }),
    [navigate, organizationId]
  )
}

// The three billing pages share this frame: a full-width SettingsHeading, then the kit's page, whose alerts come first.
// The Usage page draws its heading from the kit (its buttons open the kit's journeys) into headingSlot.
export function BillingPageLayout({
  title,
  description,
  headingSlot,
  children,
}: {
  title?: string
  description?: string
  headingSlot?: (element: HTMLDivElement | null) => void
  children: ReactNode
}) {
  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        {title && <SettingsHeading title={title} description={description} showNeedHelp={false} />}
        {headingSlot && <div ref={headingSlot} />}
        <div className="flex max-w-content-with-navigation-left flex-col gap-6">{children}</div>
      </Section>
    </div>
  )
}

const BillingUsageSkeleton = () => (
  <div className="flex flex-col gap-6" aria-label="Loading plan and usage">
    <div className="flex flex-col gap-2 border-b border-neutral pb-5">
      <Skeleton height={24} width={132} show />
      <Skeleton height={16} width={360} show />
    </div>
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-[114px] flex-1 rounded border border-neutral bg-surface-neutral p-5">
          <Skeleton height={12} width={80} show />
          <div className="mt-3">
            <Skeleton height={20} width={120} show />
          </div>
        </div>
      ))}
    </div>
    <div className="rounded border border-neutral bg-surface-neutral">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2 border-b border-neutral px-5 py-4 last:border-b-0">
          <Skeleton height={14} width={160} show />
          <Skeleton height={6} width="100%" show />
        </div>
      ))}
    </div>
  </div>
)

interface BillingUsageErrorProps {
  type: BillingUsageErrorType
  organizationId: string
  onRetry: () => void
  isRetrying: boolean
}

function BillingUsageError({ type, organizationId, onRetry, isRetrying }: BillingUsageErrorProps) {
  return match(type)
    .with('not-linked', () => (
      <EmptyState
        icon="credit-card"
        title="No plan details for this organization yet"
        description="This organization is not linked to a billing account. Your current plan and invoices are in the billing summary."
      >
        <Link
          as="button"
          to="/organization/$organizationId/settings/billing-summary"
          params={{ organizationId }}
          variant="outline"
          color="neutral"
          size="md"
        >
          Open billing summary
        </Link>
      </EmptyState>
    ))
    .with('not-a-member', () => (
      <Callout.Root color="red">
        <Callout.Icon>
          <Icon iconName="lock" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>You do not have access to this organization's usage</Callout.TextHeading>
          Only members of this organization can see its plan and usage. Ask an organization admin to invite you.
        </Callout.Text>
      </Callout.Root>
    ))
    .with('session-expired', () => (
      <Callout.Root color="red">
        <Callout.Icon>
          <Icon iconName="circle-exclamation" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Your session has expired</Callout.TextHeading>
          Reload the page to sign in again.
        </Callout.Text>
        <Button size="sm" variant="outline" color="neutral" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </Callout.Root>
    ))
    .with('unavailable', () => (
      <Callout.Root color="yellow">
        <Callout.Icon>
          <Icon iconName="triangle-exclamation" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Plan and usage could not be loaded</Callout.TextHeading>
          The billing service did not answer. Check your connection and try again.
        </Callout.Text>
        <Button size="sm" variant="outline" color="neutral" loading={isRetrying} onClick={onRetry}>
          Try again
        </Button>
      </Callout.Root>
    ))
    .exhaustive()
}

export function BillingUsageView() {
  useDocumentTitle('Usage - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const { data, error, isLoading, refetch, isRefetching } = useBillingUsage({ organizationId })
  const client = usePricingClient()
  const goTo = useBillingNavigate(organizationId)
  const { showChat } = useSupportChat()
  const [headingElement, setHeadingElement] = useState<HTMLDivElement | null>(null)

  // The kit's "Plan details" heading, drawn with SettingsHeading above the page like on Invoices and Billing
  const heading = useCallback(
    ({ title, description, actions }: UsagePageHeading) =>
      headingElement &&
      createPortal(
        <SettingsHeading title={title} description={description} showNeedHelp={false}>
          <div className="flex shrink-0 items-start gap-2">{actions}</div>
        </SettingsHeading>,
        headingElement
      ),
    [headingElement]
  )

  return (
    <BillingPageLayout headingSlot={setHeadingElement}>
      {match({ data, error, isLoading })
        .with({ isLoading: true }, () => <BillingUsageSkeleton />)
        .with({ data: P.not(P.nullish) }, ({ data }) => (
          <UsagePage
            key={organizationId}
            organizationId={organizationId}
            client={client}
            initialUsage={data}
            offers="none"
            onNavigate={goTo}
            onContactSales={showChat}
            heading={heading}
          />
        ))
        .otherwise(() => (
          <BillingUsageError
            type={getBillingUsageErrorType(error)}
            organizationId={organizationId}
            onRetry={() => refetch()}
            isRetrying={isRefetching}
          />
        ))}
    </BillingPageLayout>
  )
}

export function SettingsBillingUsage() {
  const isBillingUsageEnabled = useIsBillingUsageEnabled()

  // Emails and upgrade links point here: without the flag, show the billing summary as today
  if (!isBillingUsageEnabled) return <SettingsBillingSummary />

  return <BillingUsageView />
}

export default SettingsBillingUsage

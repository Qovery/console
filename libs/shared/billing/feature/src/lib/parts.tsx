/*
 * Small pieces shared by the billing kit's pages: a settings card (title, description, body,
 * footer with its own action), skeletons while a card loads, the "billing roles only" line, and
 * who the person is (member or billing role) without calling the invoice or payment APIs.
 */
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { match } from 'ts-pattern'
import { BillingError, type PricingClient, billing } from '@qovery/shared/billing/data-access'
import { Skeleton, toast } from '@qovery/shared/ui'

export type Access = 'member' | 'billing' | 'demo'

export function SectionCard({
  title,
  description,
  children,
  footer,
  id,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  id?: string
}) {
  return (
    <section id={id} className="rounded border border-neutral bg-surface-neutral">
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <h3 className="text-base font-medium text-neutral">{title}</h3>
          {description && <p className="mt-1 text-sm text-neutral-subtle">{description}</p>}
        </div>
        {children}
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutral px-5 py-3 sm:px-6">
          {footer}
        </div>
      )}
    </section>
  )
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={16} width={i === 0 ? '40%' : i % 2 ? '85%' : '65%'} />
      ))}
    </div>
  )
}

export const BILLING_ROLES_ONLY =
  'Only Owners, Admins and Billing Managers can see invoices and payment details. Ask one of them.'

export function BillingRolesOnly() {
  return (
    <p className="rounded border border-neutral bg-surface-neutral px-5 py-4 text-sm text-neutral-subtle">
      {BILLING_ROLES_ONLY}
    </p>
  )
}

/**
 * useAccess: the person's access on the organization. Given by the host when it knows it;
 * otherwise read from billingUsage (the plan and usage API), never from the invoice or payment
 * APIs.
 */
export function useAccess(client: PricingClient, organizationId: string, given?: Access) {
  const usage = useQuery({
    ...billing.usage({ client, organizationId }),
    enabled: !given && Boolean(organizationId),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const status = usage.error instanceof BillingError ? usage.error.status : undefined
  const error = match(status)
    .with(401, () => 'Your session has expired. Sign in again to view billing.')
    .with(404, () => 'This organization is not linked to a billing account.')
    .with(403, () => '')
    .otherwise(() => (usage.error ? errorText(usage.error) : ''))
  return {
    access: given ?? (status === 403 ? 'member' : usage.data?.access),
    error: given || usage.isFetching ? '' : error,
    retry: () => usage.refetch(),
  }
}

/** A billing role is required (members see the one line instead). */
export const isBillingAccess = (a?: Access) => a === 'billing' || a === 'demo'

/** Toasts for successes: the preview client announces its own (nothing really happens there). */
export function notifySuccess(client: PricingClient, title: string, description?: string) {
  if (client.mode !== 'preview') toast('success', title, description)
}

/** The kind of answer an action got, for the message next to it. */
export function errorText(e: unknown): string {
  if (e instanceof BillingError) {
    if (e.code === 'PAYMENT_ACTIONS_UNAVAILABLE') return 'Billing changes are not available yet.'
    if (e.code === 'BILLING_UNAVAILABLE') return 'The billing system did not answer. Try again in a minute.'
    return e.message.trim() || `Billing request failed (HTTP ${e.status}).`
  }
  return e instanceof Error ? e.message : String(e)
}

/** Opens a link in a new tab, with no access back to this page. */
export function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** Starts a download from a link Chargebee serves as an attachment: the page stays where it is. */
export function startDownload(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.rel = 'noopener noreferrer'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

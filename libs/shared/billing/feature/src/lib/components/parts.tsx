/*
 * Small pieces shared by the billing kit's pages: a settings card (title, description, body,
 * footer with its own action), skeletons while a card loads, the "billing roles only" line, and
 * who the person is (member or billing role) without calling the invoice or payment APIs.
 */
import { type ReactNode, useEffect, useState } from 'react'
import { BillingError, type PricingClient } from '@qovery/shared/billing/data-access'
import { BlockContent, Skeleton, toast } from '@qovery/shared/ui'

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
    <section id={id} className="text-sm">
      <BlockContent title={title} className="mb-0" classNameContent="flex flex-col gap-4">
        {description && <p className="text-neutral-subtle">{description}</p>}
        {children}
        {footer && <div className="flex flex-wrap items-center justify-start gap-2">{footer}</div>}
      </BlockContent>
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
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    client: PricingClient
    organizationId: string
    attempt: number
    access?: Access
    error?: string
  }>()
  useEffect(() => {
    if (given) return
    let live = true
    const request = { client, organizationId, attempt }
    client
      .billingUsage(organizationId)
      .then(({ access }) => live && setResult({ ...request, access }))
      .catch((e) => {
        if (!live) return
        if (e instanceof BillingError && e.status === 403) {
          setResult({ ...request, access: 'member' })
          return
        }
        const error =
          e instanceof BillingError && e.status === 401
            ? 'Your session has expired. Sign in again to view billing.'
            : e instanceof BillingError && e.status === 404
              ? 'This organization is not linked to a billing account.'
              : errorText(e)
        setResult({ ...request, error })
      })
    return () => {
      live = false
    }
  }, [client, organizationId, given, attempt])

  const current =
    result?.organizationId === organizationId && result.client === client && result.attempt === attempt
      ? result
      : undefined
  return {
    access: given ?? current?.access,
    error: given ? '' : current?.error ?? '',
    retry: () => setAttempt((n) => n + 1),
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

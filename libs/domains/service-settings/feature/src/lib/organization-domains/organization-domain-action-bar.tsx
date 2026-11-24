import { useQueryClient } from '@tanstack/react-query'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { mutations } from '@qovery/domains/services/data-access'
import { Button, Icon, toast, useModalConfirmation } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import {
  getDomainSelectionKey,
  getDomainTargetKey,
  getDomainTargets,
  getSelectedDomainTargets,
} from '../utils/organization-domain-targets'
import { summarizeDomainDnsChecks } from '../utils/summarize-domain-dns-checks'

interface OrganizationDomainActionBarProps {
  domains: OrganizationCustomDomainResponse[]
  disabled: boolean
  onUnselect: () => void
  onDeleted: (keys: string[]) => void
}

export function OrganizationDomainActionBar({
  domains,
  disabled,
  onUnselect,
  onDeleted,
}: OrganizationDomainActionBarProps) {
  const queryClient = useQueryClient()
  const { openModalConfirmation } = useModalConfirmation()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState({ selection: '', text: '' })
  const selection = domains.map(getDomainSelectionKey).sort().join('|')
  const targets = getSelectedDomainTargets(domains)

  const checkDns = async () => {
    setBusy(true)
    try {
      const services = [...new Map(targets.map(({ service }) => [service.id, service])).values()]
      const results = await Promise.allSettled(
        services.map((service) =>
          queryClient.fetchQuery({
            ...queries.services.checkCustomDomains({ serviceId: service.id, serviceType: service.type }),
            staleTime: 0,
            retry: false,
          })
        )
      )
      const { valid, failing, unavailable } = summarizeDomainDnsChecks(
        domains,
        new Map(
          services.map((service, index) => {
            const result = results[index]
            return [service.id, result.status === 'fulfilled' ? result.value : undefined]
          })
        )
      )
      setFeedback({ selection, text: `DNS check: ${valid} valid, ${failing} failing, ${unavailable} unavailable.` })
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = () => {
    // Keep only failed configurations for retries in this confirmation dialog.
    let pending = targets
    openModalConfirmation({
      title: 'Delete selected domains',
      confirmationMethod: 'action',
      description: `Delete ${domains.length} selected ${pluralize(domains.length, 'domain')} from all associated services? Type "delete" to confirm. Redeploy affected services to apply the changes.`,
      action: async () => {
        setBusy(true)
        try {
          const outcomes = await Promise.allSettled(
            pending.map((target) =>
              mutations.deleteCustomDomain({
                serviceId: target.service.id,
                serviceType: target.service.type,
                customDomainId: target.custom_domain_id,
              })
            )
          )
          const attempted = pending
          pending = pending.filter((_, index) => outcomes[index].status === 'rejected')
          const failed = new Set(pending.map(getDomainTargetKey))
          onDeleted(
            domains
              .filter((domain) => getDomainTargets(domain).every((target) => !failed.has(getDomainTargetKey(target))))
              .map(getDomainSelectionKey)
          )
          for (const target of attempted) {
            queryClient.invalidateQueries({
              queryKey: queries.services.customDomains({
                serviceId: target.service.id,
                serviceType: target.service.type,
              }).queryKey,
            })
            queryClient.invalidateQueries({
              queryKey: queries.services.listLinks({ serviceId: target.service.id, serviceType: target.service.type })
                .queryKey,
            })
          }
          queryClient.invalidateQueries({ queryKey: queries.customDomains.organizationList._def })
          if (!pending.length)
            toast('success', 'Selected domains deleted', 'Redeploy affected services to apply the changes.')
          if (pending.length) {
            setFeedback({
              selection,
              text: `${pending.length} service ${pluralize(pending.length, 'configuration')} could not be deleted. Confirm again to retry only those failures.`,
            })
            toast(
              'error',
              'Some domains could not be deleted',
              'Confirm again to retry the failed service configurations.'
            )
            throw new Error('Some domain configurations could not be deleted')
          }
        } finally {
          setBusy(false)
        }
      },
    })
  }
  if (!domains.length) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-overlay flex justify-center px-4">
      <div
        role="region"
        aria-label="Selected domain actions"
        className="pointer-events-auto w-max max-w-full rounded-lg border border-neutral bg-surface-neutral p-3 pl-4 text-sm text-neutral shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="shrink-0 whitespace-nowrap">
            {domains.length} selected {pluralize(domains.length, 'domain')}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="px-1 text-ssm font-medium text-neutral-subtle underline"
              disabled={busy}
              onClick={onUnselect}
            >
              Unselect
            </button>
            <Button
              size="md"
              color="neutral"
              variant="outline"
              disabled={disabled || busy || !targets.length}
              onClick={checkDns}
            >
              <Icon iconName="arrow-rotate-right" />
              Check DNS records
            </Button>
            <Button
              size="md"
              color="red"
              variant="outline"
              disabled={disabled || busy || !targets.length}
              onClick={confirmDelete}
            >
              <Icon iconName="trash" iconStyle="regular" />
              Delete
            </Button>
          </div>
        </div>
        {busy ? (
          <p role="status" className="mt-2 text-xs text-neutral-subtle">
            Processing selected domains…
          </p>
        ) : feedback.selection === selection && feedback.text ? (
          <p role="status" className="mt-2 text-xs text-neutral-subtle">
            {feedback.text}
          </p>
        ) : null}
      </div>
    </div>
  )
}

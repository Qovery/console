import { useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useBulkDeleteOrganizationCustomDomains } from '@qovery/domains/custom-domains/feature'
import { Button, Icon, toast, useModalConfirmation } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { getDomainSelectionKey, getSelectedDomainTargets } from '../utils/organization-domain-targets'
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
  const { organizationId = '' } = useParams({ strict: false })
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteDomains, isLoading: isDeleting } = useBulkDeleteOrganizationCustomDomains()
  const [checkingDns, setCheckingDns] = useState(false)
  const busy = checkingDns || isDeleting
  const targets = getSelectedDomainTargets(domains)

  const checkDns = async () => {
    setCheckingDns(true)
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
      toast(
        failing ? 'error' : unavailable ? 'warning' : 'success',
        'DNS records checked',
        `${valid} valid, ${failing} failing, ${unavailable} unavailable.`
      )
    } finally {
      setCheckingDns(false)
    }
  }

  const confirmDelete = () => {
    openModalConfirmation({
      title: 'Delete selected domains',
      confirmationMethod: 'action',
      description: `Delete ${domains.length} selected ${pluralize(domains.length, 'domain')} from all associated services? Type "delete" to confirm. Redeploy affected services to apply the changes.`,
      // Throws on failure, which keeps the confirmation open: nothing was deleted, so confirming again retries all.
      action: async () => {
        await deleteDomains({
          organizationId,
          domains: domains.map(({ environment_id, domain }) => ({ environment_id, domain })),
        })
        onDeleted(domains.map(getDomainSelectionKey))
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
              loading={checkingDns}
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
              <Icon iconName="trash-can" iconStyle="regular" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

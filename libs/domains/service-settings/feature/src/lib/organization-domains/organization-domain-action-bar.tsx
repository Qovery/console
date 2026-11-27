import { useParams } from '@tanstack/react-router'
import {
  type OrganizationCustomDomainCheckResponse,
  type OrganizationCustomDomainResponse,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { useBulkDeleteOrganizationCustomDomains } from '@qovery/domains/custom-domains/feature'
import { Button, Icon, toast, useModalConfirmation } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { getDomainSelectionKey, getSelectedDomainTargets } from '../utils/organization-domain-targets'
import { getDomainDnsStatus, summarizeDomainDnsStatuses } from '../utils/summarize-domain-dns-checks'

interface OrganizationDomainActionBarProps {
  domains: OrganizationCustomDomainResponse[]
  disabled: boolean
  // Re-runs the DNS checks of the page. Rejects when they could not run.
  checkDns: () => Promise<OrganizationCustomDomainCheckResponse[]>
  onUnselect: () => void
  onDeleted: (keys: string[]) => void
}

export function OrganizationDomainActionBar({
  domains,
  disabled,
  checkDns,
  onUnselect,
  onDeleted,
}: OrganizationDomainActionBarProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteDomains, isLoading: isDeleting } = useBulkDeleteOrganizationCustomDomains()
  const [checkingDns, setCheckingDns] = useState(false)
  const busy = checkingDns || isDeleting
  const targets = getSelectedDomainTargets(domains)

  const checkDomainsDns = async () => {
    setCheckingDns(true)
    try {
      const results = new Map((await checkDns()).map((result) => [getDomainSelectionKey(result), result]))
      const { valid, failing, unknown } = summarizeDomainDnsStatuses(
        domains.map((domain) => getDomainDnsStatus(results.get(getDomainSelectionKey(domain))))
      )
      toast(
        failing ? 'error' : unknown ? 'warning' : 'success',
        'DNS records checked',
        `${valid} valid, ${failing} failing, ${unknown} unknown.`
      )
    } catch (error) {
      toast('error', 'DNS records could not be checked', (error as { message?: string }).message)
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
              onClick={checkDomainsDns}
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

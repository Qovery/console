import { CopyButton, Skeleton } from '@qovery/shared/ui'

export interface OrganizationDomainCnameRecordsProps {
  domain: string
  target?: string | null
  loading?: boolean
  // Shown instead of the target when it is not known and not loading.
  unavailableMessage?: string
}

// Record names only depend on the domain, so the block keeps its final layout while the target loads.
export function OrganizationDomainCnameRecords({
  domain,
  target,
  loading = false,
  unavailableMessage,
}: OrganizationDomainCnameRecordsProps) {
  const name = domain || '<your-domain>'
  const records = [name, ...(name.includes('*') ? [] : [`*.${name}`])].map((record) => `${record} CNAME`)
  return (
    <div className="overflow-hidden rounded-lg border border-neutral">
      <div className="border-b border-neutral bg-surface-neutral-subtle px-3 py-2 text-xs font-medium text-neutral">
        CNAME configuration
      </div>
      <div className="flex items-start justify-between gap-3 py-2 pl-3 pr-2">
        <dl className="flex min-w-0 flex-col gap-2 font-code text-xs leading-5">
          {records.map((record) => (
            <div key={record} className="min-w-0">
              <dt className="truncate text-info">{record}</dt>
              <dd className="h-5 truncate text-neutral-subtle">
                {target ? (
                  target
                ) : loading ? (
                  <span className="flex h-full items-center">
                    <Skeleton width={240} height={12} />
                  </span>
                ) : (
                  <span className="font-sans italic">{unavailableMessage}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {target ? (
          <CopyButton iconOnly size="xs" content={records.map((record) => `${record} ${target}`).join('\n')} />
        ) : loading ? (
          <Skeleton width={24} height={24} className="shrink-0" />
        ) : null}
      </div>
    </div>
  )
}

export default OrganizationDomainCnameRecords

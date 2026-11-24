import { type ReactNode } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface OrganizationDomainRouteItemProps {
  path: string
  // `project/environment/service`
  service: string
  port?: number | null
  removed?: boolean
  error?: string
  actions?: ReactNode
}

export function OrganizationDomainRouteItem({
  path,
  service,
  port,
  removed = false,
  error,
  actions,
}: OrganizationDomainRouteItemProps) {
  return (
    <li className="border-b border-neutral px-4 py-3 text-ssm last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className={twMerge('min-w-0', removed && 'opacity-50')}>
          <p className={twMerge('truncate font-medium text-neutral', removed && 'line-through')}>{path}</p>
          <p className="mt-1 flex gap-2 text-neutral-subtle">
            <span className="truncate">Service: {service}</span>
            {port !== undefined ? <span className="shrink-0">Port: {port ?? 'none'}</span> : null}
          </p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-negative">
          {error}
        </p>
      ) : null}
    </li>
  )
}

export default OrganizationDomainRouteItem

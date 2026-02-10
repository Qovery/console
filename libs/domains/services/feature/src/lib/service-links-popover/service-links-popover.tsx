import { type Link as LinkProps } from 'qovery-typescript-axios'
import { type ReactNode, useMemo } from 'react'
import { APPLICATION_SETTINGS_DOMAIN_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import {
  CopyToClipboardButtonIcon,
  Icon,
  Link,
  Popover,
  type PopoverContentProps,
  Skeleton,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { useLinks } from '../hooks/use-links/use-links'
import { useServiceType } from '../hooks/use-service-type/use-service-type'

export interface ServiceLinksPopoverProps extends Pick<PopoverContentProps, 'align' | 'side'> {
  organizationId: string
  projectId: string
  environmentId: string
  serviceId: string
  children: ReactNode
}

export function ServiceLinksPopover({
  organizationId,
  projectId,
  environmentId,
  serviceId,
  children,
  align = 'end',
  side = 'bottom',
}: ServiceLinksPopoverProps) {
  const { data: serviceType } = useServiceType({ environmentId, serviceId })
  const { data: links = [] } = useLinks({ serviceId, serviceType })

  // Remove default Qovery links
  const filteredLinks = useMemo(
    () => links.filter((link: LinkProps) => !(link.is_default && link.is_qovery_domain)),
    [links]
  )

  // Separate links into nginx and gateway-api groups
  const nginxLinks = useMemo(
    () => filteredLinks.filter((link: LinkProps) => !link.url?.includes('gateway-api')),
    [filteredLinks]
  )
  const gatewayApiLinks = useMemo(
    () => filteredLinks.filter((link: LinkProps) => link.url?.includes('gateway-api')),
    [filteredLinks]
  )

  const pathDomainsSetting =
    APPLICATION_URL(organizationId, projectId, environmentId, serviceId) +
    APPLICATION_SETTINGS_URL +
    APPLICATION_SETTINGS_DOMAIN_URL

  if (!links) {
    return <Skeleton height={40} width={110} />
  }

  return (
    <Popover.Root modal={true}>
      <Popover.Trigger className={filteredLinks.length === 0 ? 'hidden' : ''}>{children}</Popover.Trigger>
      <Popover.Content
        side={side}
        className="max-w-[280px] border-transparent p-2 text-sm text-neutral-subtle"
        align={align}
      >
        <div className="flex items-center justify-between p-2">
          <p className="font-medium text-neutral">
            {filteredLinks?.length ?? 0} {pluralize(filteredLinks?.length ?? 0, 'link')} attached
          </p>
          {serviceType !== 'HELM' && (
            <Popover.Close>
              <Link to={pathDomainsSetting} color="neutral" className="text-ssm">
                Customize
                <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
              </Link>
            </Popover.Close>
          )}
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {nginxLinks.map((link: LinkProps) => (
            <li key={link.url} className="flex p-2">
              <CopyToClipboardButtonIcon className="mr-2 text-brand hover:text-brand-hover" content={link.url ?? ''} />
              <a
                className="flex w-full items-center justify-between text-brand transition hover:text-brand-hover"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="mr-2 text-ssm font-medium">
                  <Truncate text={link.url ?? ''} truncateLimit={26} />
                </div>
                <div className="text-xs text-neutral-subtle">{link.internal_port}</div>
              </a>
            </li>
          ))}
          {nginxLinks.length > 0 && gatewayApiLinks.length > 0 && (
            <>
              <li className="my-2 border-t border-neutral" />
              <li className="flex items-center gap-1 px-2 pb-1 text-xs font-medium text-neutral">
                <span>Gateway API / Envoy stack</span>
                <Tooltip
                  content={
                    <div className="max-w-xs">
                      Links pointing to your service using the new Gateway API / Envoy stack. We strongly recommend to
                      test it and report any issues / improvements we can do before we sunset nginx stack,{' '}
                      <a
                        href="https://www.qovery.com/blog/nginx-ingress-controller-end-of-maintenance-by-march-2026"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        more info
                      </a>
                    </div>
                  }
                  side="right"
                  classNameContent="max-w-xs"
                >
                  <span className="inline-flex cursor-help">
                    <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                  </span>
                </Tooltip>
              </li>
            </>
          )}
          {gatewayApiLinks.map((link: LinkProps) => (
            <li key={link.url} className="flex p-2">
              <CopyToClipboardButtonIcon className="mr-2 text-brand hover:text-brand-hover" content={link.url ?? ''} />
              <a
                className="flex w-full items-center justify-between text-brand transition hover:text-brand-hover"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="mr-2 text-ssm font-medium">
                  <Truncate text={link.url ?? ''} truncateLimit={26} />
                </div>
                <div className="text-xs text-neutral-subtle">{link.internal_port}</div>
              </a>
            </li>
          ))}
        </ul>
      </Popover.Content>
    </Popover.Root>
  )
}

export default ServiceLinksPopover

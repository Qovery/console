import { type Link as LinkProps } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { APPLICATION_SETTINGS_DOMAIN_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import {
  CopyToClipboardButtonIcon,
  Icon,
  IconAwesomeEnum,
  Link,
  Popover,
  type PopoverContentProps,
  Skeleton,
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
  const filteredLinks = links.filter((link: LinkProps) => !(link.is_default && link.is_qovery_domain))

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
        className="p-2 text-neutral-350 text-sm border-transparent max-w-[280px]"
        align={align}
      >
        <div className="p-2 flex justify-between items-center">
          <p className="text-neutral-350 font-medium">
            {filteredLinks?.length ?? 0} {pluralize(filteredLinks?.length ?? 0, 'link')} attached
          </p>
          {serviceType !== 'HELM' && (
            <Popover.Close>
              <Link to={pathDomainsSetting} color="brand" className="text-ssm">
                Customize
                <Icon name={IconAwesomeEnum.CIRCLE_PLUS} className="text-xs" />
              </Link>
            </Popover.Close>
          )}
        </div>
        <ul>
          {filteredLinks.map((link: LinkProps) => (
            <li key={link.url} className="flex p-2">
              <CopyToClipboardButtonIcon
                className="text-brand-500 hover:text-brand-600 mr-2"
                content={link.url ?? ''}
              />
              <a
                className="transition flex items-center justify-between w-full text-neutral-400 hover:text-brand-500"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="text-ssm font-medium mr-2">
                  <Truncate text={link.url ?? ''} truncateLimit={26} />
                </div>
                <div className="text-xs text-neutral-350">{link.internal_port}</div>
              </a>
            </li>
          ))}
        </ul>
      </Popover.Content>
    </Popover.Root>
  )
}

export default ServiceLinksPopover

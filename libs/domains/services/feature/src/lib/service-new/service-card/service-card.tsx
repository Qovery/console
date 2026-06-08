import clsx from 'clsx'
import posthog from 'posthog-js'
import { type CloudProviderEnum, type LifecycleTemplateListResponseResultsInner } from 'qovery-typescript-axios'
import { type ReactElement, cloneElement, useState } from 'react'
import { Badge, Button, Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { TemplateIds } from '@qovery/shared/util-services'
import { ServiceIcons } from '../../service-icon/service-icon'
import { getServicesPath, servicePathSuffix } from '../service-new-utils/service-new-utils'
import {
  type ServiceTemplateOptionType,
  type ServiceTemplateType,
  type TagsEnum,
  serviceTemplates,
} from '../service-templates'

export type ServiceBlock = {
  title: string
  description: string
  icon: ReactElement
  cloud_provider?: CloudProviderEnum | string
  link?: string
  onClick?: () => void
  disabledCTA?: ReactElement
  badge?: string
}

export function Card({ title, description, icon, link, onClick, disabledCTA, badge }: ServiceBlock) {
  const Wrapper = ({ children }: { children: ReactElement }) => {
    const className = twMerge(
      'flex cursor-pointer items-center justify-between gap-5 rounded border border-neutral px-5 py-4 transition [box-shadow:0px_2px_8px_-1px_rgba(27,36,44,0.08),0px_2px_2px_-1px_rgba(27,36,44,0.04)]',
      disabledCTA ? 'border-neutral bg-surface-neutral-subtle' : 'hover:bg-surface-neutral-subtle'
    )

    if (onClick) {
      return (
        <div onClick={onClick} className={className}>
          {children}
        </div>
      )
    }

    if (!link) {
      return <div className={className}>{children}</div>
    }

    return (
      // @ts-expect-error-next-line TODO new-nav : Route strings need to be updated using the next typed routes
      <Link to={link} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <Wrapper>
      <>
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-ssm font-medium text-neutral">{title}</h3>
              {badge && <ServiceBadge>{badge}</ServiceBadge>}
            </div>
            <p className="max-w-96 text-xs text-neutral-subtle">{description}</p>
          </div>
          {disabledCTA}
        </div>
        {icon}
      </>
    </Wrapper>
  )
}

function ServiceBadge({ children }: { children: string }) {
  return (
    <Badge
      radius="full"
      variant="surface"
      color="purple"
      size="sm"
      className="h-4 border-transparent bg-surface-accent1-component px-1 text-[8px]  text-accent1"
    >
      {children}
    </Badge>
  )
}

interface CardOptionProps extends ServiceTemplateOptionType {
  parentSlug: string
  organizationId: string
  projectId: string
  environmentId: string
  isTerraformFeatureFlag?: boolean
  onUpgradePlanClick?: () => void
}

function CardOption({
  parentSlug,
  slug,
  icon,
  title,
  description,
  type,
  recommended,
  badge,
  template_id,
  icon_uri,
  organizationId,
  projectId,
  environmentId,
  isTerraformFeatureFlag,
  onUpgradePlanClick,
}: CardOptionProps) {
  const iconClassName = ServiceIcons[icon_uri].className
  const pathSuffix = servicePathSuffix(type, parentSlug, slug)
  const to = pathSuffix ? getServicesPath(organizationId, projectId, environmentId, pathSuffix) : undefined

  const isTerraformUpgrade = template_id === TemplateIds.TERRAFORM && !isTerraformFeatureFlag && onUpgradePlanClick

  if (isTerraformUpgrade) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onUpgradePlanClick}
        onKeyDown={(e) => e.key === 'Enter' && onUpgradePlanClick()}
        className="flex cursor-pointer items-start gap-3 rounded-sm border border-neutral bg-surface-neutral-subtle p-3 transition hover:bg-surface-neutral-componentHover"
      >
        <img className={twMerge('mt-1 select-none', iconClassName)} width={24} height={24} src={icon} alt={title} />
        <span className="flex flex-1 flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-ssm font-medium text-neutral">
            {title}
            {badge && <ServiceBadge>{badge}</ServiceBadge>}
          </span>
          <span className="inline-block text-xs text-neutral-subtle">{description}</span>
          <p className="cursor-pointer text-xs font-medium text-neutral-subtle">
            Upgrade your plan <Icon iconName="chevron-right" className="ml-1 text-2xs" />
          </p>
        </span>
      </div>
    )
  }

  if (!to) return null

  return (
    <Link
      // @ts-expect-error-next-line TODO new-nav : Route strings need to be updated using the next typed routes
      to={to}
      className="flex items-start gap-3 rounded-sm border border-neutral bg-surface-neutral-component p-3 transition hover:bg-surface-neutral-componentHover"
      onClick={() =>
        posthog.capture('select-service', {
          qoveryServiceType: type,
          selectedServiceType: parentSlug,
          selectedServiceSubType: slug,
        })
      }
    >
      <img className={twMerge('mt-1 select-none', iconClassName)} width={24} height={24} src={icon} alt={title} />
      <span>
        <span className="inline-flex items-center gap-2 text-ssm font-medium text-neutral">
          {title}
          {badge && <ServiceBadge>{badge}</ServiceBadge>}
          {recommended && (
            <span className="relative -top-0.5 inline-block rounded bg-surface-brand-solid px-1 text-2xs text-neutralInvert">
              Fastest
            </span>
          )}
        </span>
        <span className="inline-block text-xs text-neutral-subtle">{description}</span>
      </span>
      <span className="flex h-full items-center pr-1">
        <Icon iconName="chevron-right" className="text-xs text-neutral-subtle" />
      </span>
    </Link>
  )
}

export function CardService({
  title,
  icon,
  description,
  slug,
  options,
  type,
  link,
  availableTemplates,
  organizationId,
  projectId,
  environmentId,
  cloudProvider,
  icon_uri,
  isTerraformFeatureFlag,
  onUpgradePlanClick,
}: Omit<ServiceTemplateType, 'cloud_provider'> & {
  cloud_provider?: CloudProviderEnum | string
  availableTemplates: LifecycleTemplateListResponseResultsInner[]
  organizationId: string
  projectId: string
  environmentId: string
  cloudProvider?: CloudProviderEnum | string
  isTerraformFeatureFlag: boolean
  onUpgradePlanClick?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const iconClassName = icon_uri ? ServiceIcons[icon_uri].className : undefined

  if (options && !slug) {
    return null
  }

  if (options) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className={clsx({
          'flex cursor-pointer items-center gap-6 rounded border border-neutral p-5 transition [box-shadow:0px_2px_8px_-1px_rgba(27,36,44,0.08),0px_2px_2px_-1px_rgba(27,36,44,0.04)] hover:bg-surface-neutral-subtle':
            true,
          'col-span-3 bg-surface-neutral-subtle p-6': expanded,
        })}
      >
        {expanded ? (
          <div className="flex w-full flex-col gap-8">
            <div className="relative flex gap-6">
              <img
                className={twMerge('select-none', iconClassName)}
                width={52}
                height={52}
                src={icon as string}
                alt={title}
              />
              <div>
                <h3 className="mb-1 text-base font-medium text-neutral">{title}</h3>
                <p className="max-w-96 text-ssm text-neutral-subtle">{description}</p>
              </div>
              <Button
                className="absolute right-0 top-0"
                color="neutral"
                variant="surface"
                iconOnly
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(false)
                }}
              >
                <Icon iconName="xmark" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {options
                .filter((c) => {
                  if (c.template_id === TemplateIds.TERRAFORM && !isTerraformFeatureFlag) return true
                  if (c.template_id) {
                    return availableTemplates.reduce((acc, template) => c.template_id === template.id || acc, false)
                  }
                  return true
                })
                .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
                .sort((a, b) => {
                  if (a.recommended && !b.recommended) return -1
                  if (!a.recommended && b.recommended) return 1
                  return a.title.localeCompare(b.title)
                })
                .map((props) => (
                  <CardOption
                    key={props.slug}
                    parentSlug={slug ?? ''}
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    isTerraformFeatureFlag={isTerraformFeatureFlag}
                    onUpgradePlanClick={onUpgradePlanClick}
                    {...props}
                  />
                ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-full w-60 flex-col justify-between gap-2">
              <div>
                <h3 className="mb-1 text-ssm font-medium text-neutral">{title}</h3>
                <p className="text-xs text-neutral-subtle">{description}</p>
              </div>
              <p className="text-xs font-medium text-neutral-subtle">
                Click to select an option <Icon iconName="chevron-right" className="ml-1 text-2xs" />
              </p>
            </div>
            <span className="relative">
              {typeof icon === 'string' ? (
                <img className={twMerge('max-h-10 w-14 select-none', iconClassName)} src={icon} alt={title} />
              ) : (
                cloneElement(icon as ReactElement, {
                  className: twMerge('w-10', iconClassName),
                })
              )}
            </span>
          </>
        )}
      </div>
    )
  }

  const pathSuffix = type && slug ? servicePathSuffix(type, slug, 'current') : undefined
  const to = link ?? (pathSuffix ? getServicesPath(organizationId, projectId, environmentId, pathSuffix) : undefined)

  if (!to) return null

  return (
    <Link
      // @ts-expect-error-next-line TODO new-nav : Route strings need to be updated using the next typed routes
      to={to}
      className="flex gap-6 rounded border border-neutral p-5 transition [box-shadow:0px_2px_8px_-1px_rgba(27,36,44,0.08),0px_2px_2px_-1px_rgba(27,36,44,0.04)] hover:bg-surface-neutral-subtle"
      onClick={() =>
        posthog.capture('select-service', {
          qoveryServiceType: type,
          selectedServiceSubType: slug,
        })
      }
    >
      <div className="w-60">
        <h3 className="mb-1 text-ssm font-medium text-neutral">{title}</h3>
        <p className="text-xs text-neutral-subtle">{description}</p>
      </div>
      <div className="flex items-center">
        {typeof icon === 'string' ? (
          <img className={twMerge('max-h-10 w-14 select-none', iconClassName)} src={icon} alt={title} />
        ) : (
          cloneElement(icon as ReactElement, {
            className: twMerge('w-10', iconClassName),
          })
        )}
      </div>
    </Link>
  )
}

export function SectionByTag({
  title,
  description,
  tag,
  cloudProvider,
  availableTemplates,
  organizationId,
  projectId,
  environmentId,
  isTerraformFeatureFlag,
  onUpgradePlanClick,
}: {
  title: string
  tag: keyof typeof TagsEnum
  cloudProvider?: CloudProviderEnum | string
  description?: string
  availableTemplates: LifecycleTemplateListResponseResultsInner[]
  organizationId: string
  projectId: string
  environmentId: string
  isTerraformFeatureFlag: boolean
  onUpgradePlanClick?: () => void
}) {
  return (
    <Section>
      <Heading className="mb-1">{title}</Heading>
      {description && <p className="text-xs text-neutral-subtle">{description}</p>}
      <div className="mt-5 grid grid-cols-3 gap-4">
        {serviceTemplates
          .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
          .filter(({ tag: t }) => t === tag)
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((service) => (
            <CardService
              key={service.title}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              cloudProvider={cloudProvider}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={onUpgradePlanClick}
              {...service}
            />
          ))}
      </div>
    </Section>
  )
}

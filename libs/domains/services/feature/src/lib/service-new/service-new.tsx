import clsx from 'clsx'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type CloudProviderEnum, type LifecycleTemplateListResponseResultsInner } from 'qovery-typescript-axios'
import { type ReactElement, cloneElement, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'
import {
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_HELM_TEMPLATE_CREATION_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL,
  SERVICES_TERRAFORM_CREATION_URL,
} from '@qovery/shared/routes'
import { Badge, Button, ExternalLink, Heading, Icon, InputSearch, Link, Section } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { TemplateIds } from '@qovery/shared/util-services'
import {
  type ServiceTemplateOptionType,
  type ServiceTemplateType,
  type TagsEnum,
  serviceTemplates,
} from './service-templates'

const CloudFormationIcon = '/assets/devicon/cloudformation.svg'

const SERVICE_TEMPLATE_ICON_INVERT_DARK_TITLES = new Set(['Apache Kafka', 'Replibyte', 'Rust', 'Flask', 'Temporal'])

const getEnvironmentBasePath = (organizationId: string, projectId: string, environmentId: string) =>
  `/organization/${organizationId}/project/${projectId}/environment/${environmentId}`

const getServicesPath = (organizationId: string, projectId: string, environmentId: string, subPath: string) =>
  `${getEnvironmentBasePath(organizationId, projectId, environmentId)}${subPath}`

const CREATE_FLOW_SLUG_BY_TYPE: Partial<Record<ServiceType, string>> = {
  APPLICATION: 'application',
  CONTAINER: 'container',
  DATABASE: 'database',
  HELM: 'helm',
  JOB: 'lifecycle-job',
  LIFECYCLE_JOB: 'lifecycle-job',
  CRON_JOB: 'cron-job',
  TERRAFORM: 'terraform',
}

const CREATE_FLOW_SLUGS = new Set(Object.values(CREATE_FLOW_SLUG_BY_TYPE))

/**
 * Path = flow slug (from config), template = preset id in query.
 * Works for card-by-type (Application > Next.js) and card-by-template (Apache Kafka > Container).
 * */
function getCreateFlowPathParams(
  type: ServiceType,
  parentSlug: string,
  slug: string
): { flowSlug: string; templateSlug: string | undefined } {
  if (slug === 'current') {
    const flowSlug = CREATE_FLOW_SLUGS.has(parentSlug) ? parentSlug : CREATE_FLOW_SLUG_BY_TYPE[type] ?? parentSlug
    const templateSlug = CREATE_FLOW_SLUGS.has(parentSlug) ? undefined : parentSlug
    return { flowSlug, templateSlug }
  }
  const flowSlug = CREATE_FLOW_SLUGS.has(parentSlug) ? parentSlug : slug
  const templateSlug = CREATE_FLOW_SLUGS.has(parentSlug) ? (CREATE_FLOW_SLUGS.has(slug) ? undefined : slug) : parentSlug
  return { flowSlug, templateSlug }
}

/** Builds /service/create/:flowSlug with optional ?template= for presets. Use for any type listed in CREATE_FLOW_SLUG_BY_TYPE. */
function getCreateFlowPath(flowSlug: string, templateSlug?: string): string {
  const path = `/service/create/${flowSlug}`
  if (templateSlug && templateSlug !== 'current') {
    return `${path}?template=${encodeURIComponent(templateSlug)}`
  }
  return path
}

function buildCreateFlowPathForType(type: ServiceType, parentSlug: string, slug: string): string | undefined {
  const flowSlug = CREATE_FLOW_SLUG_BY_TYPE[type]
  if (!flowSlug) return undefined

  if (type === 'DATABASE') {
    const templateSlug = parentSlug === flowSlug || parentSlug === 'current' ? undefined : parentSlug
    const optionSlug = slug === 'current' ? undefined : slug
    const path = getCreateFlowPath(flowSlug, templateSlug)

    if (optionSlug) {
      return `${path}${templateSlug ? '&' : '?'}option=${encodeURIComponent(optionSlug)}`
    }

    return path
  }

  const { flowSlug: resolvedFlowSlug, templateSlug } = getCreateFlowPathParams(type, parentSlug, slug)
  return getCreateFlowPath(resolvedFlowSlug, templateSlug)
}

function Card({
  title,
  description,
  icon,
  link,
  onClick,
  disabledCTA,
  badge,
}: {
  title: string
  description: string
  icon: ReactElement
  link?: string
  onClick?: () => void
  disabledCTA?: ReactElement
  badge?: string
}) {
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
              {badge && (
                <Badge
                  radius="full"
                  variant="surface"
                  color="purple"
                  size="sm"
                  className="h-4 border-transparent bg-surface-accent1-component px-1 text-[8px] font-bold text-accent1"
                >
                  {badge}
                </Badge>
              )}
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

/** Types listed in CREATE_FLOW_SLUG_BY_TYPE use /service/create/:flowSlug?template=; others use legacy URLs until migrated. */
const servicePathSuffix = (type: ServiceType, parentSlug: string, slug: string) =>
  match(type)
    .with('APPLICATION', 'CONTAINER', 'DATABASE', () => buildCreateFlowPathForType(type, parentSlug, slug))
    .with('LIFECYCLE_JOB', () => SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('HELM', () => SERVICES_HELM_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('JOB', 'CRON_JOB', () => undefined)
    .with('TERRAFORM', () => undefined)
    .otherwise(() => buildCreateFlowPathForType(type, parentSlug, slug))

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
  organizationId,
  projectId,
  environmentId,
  isTerraformFeatureFlag,
  onUpgradePlanClick,
}: CardOptionProps) {
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
        <img className="mt-1 select-none" width={24} height={24} src={icon} alt={title} />
        <span className="flex flex-1 flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-ssm font-medium text-neutral">
            {title}
            {badge && (
              <Badge
                radius="full"
                variant="surface"
                color="purple"
                size="sm"
                className="h-4 border-transparent bg-surface-accent1-component px-1 text-[8px] font-bold text-accent1"
              >
                {badge}
              </Badge>
            )}
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
      <img className="mt-1 select-none" width={24} height={24} src={icon} alt={title} />
      <span>
        <span className="inline-flex items-center gap-2 text-ssm font-medium text-neutral">
          {title}
          {badge && (
            <Badge
              radius="full"
              variant="surface"
              color="purple"
              size="sm"
              className="h-4 border-transparent bg-surface-accent1-component px-1 text-[8px] font-bold text-accent1"
            >
              {badge}
            </Badge>
          )}
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

function CardService({
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
                className={twMerge('select-none', SERVICE_TEMPLATE_ICON_INVERT_DARK_TITLES.has(title) && 'dark:invert')}
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
                <img
                  className={twMerge(
                    'max-h-10 w-14 select-none',
                    SERVICE_TEMPLATE_ICON_INVERT_DARK_TITLES.has(title) && 'dark:invert'
                  )}
                  src={icon}
                  alt={title}
                />
              ) : (
                cloneElement(icon as ReactElement, {
                  className: twMerge('w-10', SERVICE_TEMPLATE_ICON_INVERT_DARK_TITLES.has(title) && 'dark:invert'),
                })
              )}
            </span>
          </>
        )}
      </div>
    )
  }

  const pathSuffix = link ?? (type && slug ? servicePathSuffix(type, slug, 'current') : undefined)
  const to = pathSuffix ? getServicesPath(organizationId, projectId, environmentId, pathSuffix) : undefined

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
          <img
            className={twMerge(
              'max-h-10 w-14 select-none',
              SERVICE_TEMPLATE_ICON_INVERT_DARK_TITLES.has(title) && 'dark:invert'
            )}
            src={icon}
            alt={title}
          />
        ) : (
          cloneElement(icon as ReactElement, {
            className: twMerge('w-10', SERVICE_TEMPLATE_ICON_INVERT_DARK_TITLES.has(title) && 'dark:invert'),
          })
        )}
      </div>
    </Link>
  )
}

function SectionByTag({
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

type ServiceBlock = {
  title: string
  description: string
  icon: ReactElement
  cloud_provider?: CloudProviderEnum | string
  link?: string
  onClick?: () => void
  disabledCTA?: ReactElement
  badge?: string
}

export interface ServiceNewProps {
  organizationId: string
  projectId: string
  environmentId: string
  /** From environment.cloud_provider.provider (may be string from API) */
  cloudProvider?: CloudProviderEnum | string
  availableTemplates?: LifecycleTemplateListResponseResultsInner[]
}

export function ServiceNew({
  organizationId,
  projectId,
  environmentId,
  cloudProvider,
  availableTemplates = [],
}: ServiceNewProps) {
  const isTerraformFeatureFlag = Boolean(useFeatureFlagEnabled('terraform'))
  const { showPylonForm } = useSupportChat()

  const serviceEmpty: ServiceBlock[] = useMemo(
    () => [
      {
        title: 'Application',
        description: 'Deploy a long running service running from Git or a Container Registry.',
        icon: <Icon name="APPLICATION" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, getCreateFlowPath('application')),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Database',
        description: 'Easy and fastest way to deploy the most popular databases.',
        icon: <Icon name="DATABASE" width={32} height={32} />,
        link: getServicesPath(
          organizationId,
          projectId,
          environmentId,
          buildCreateFlowPathForType('DATABASE', 'database', 'current') ?? '/service/create/database'
        ),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Lifecycle Job',
        description: 'Execute any type of script coming from Git or a Container Registry.',
        icon: <Icon name="LIFECYCLE_JOB" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, SERVICES_LIFECYCLE_CREATION_URL),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Cron Job',
        description: 'Execute any type of script at a regular basis.',
        icon: <Icon name="CRON_JOB" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, SERVICES_CRONJOB_CREATION_URL),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Helm',
        description: 'Deploy a Helm Chart on your Kubernetes cluster.',
        icon: <Icon name="HELM" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, SERVICES_HELM_CREATION_URL),
        cloud_provider: cloudProvider,
      },
      ...(isTerraformFeatureFlag
        ? [
            {
              title: 'Terraform',
              description: 'Deploy external cloud resources directly from your Terraform configuration.',
              icon: <Icon name="TERRAFORM" width={32} height={32} />,
              link: getServicesPath(organizationId, projectId, environmentId, SERVICES_TERRAFORM_CREATION_URL),
              cloud_provider: cloudProvider,
              badge: 'NEW',
            },
          ]
        : [
            {
              title: 'Terraform',
              description: 'Terraform native service is available only for organizations on the Team plan or higher.',
              icon: <Icon name="TERRAFORM" width={32} height={32} />,
              onClick: () => showPylonForm('request-upgrade-plan'),
              cloud_provider: cloudProvider,
              disabledCTA: (
                <p className="cursor-pointer text-xs font-medium text-neutral-subtle">
                  Upgrade your plan <Icon iconName="chevron-right" className="ml-1 text-2xs" />
                </p>
              ),
              badge: 'NEW',
            },
          ]),
    ],
    [cloudProvider, organizationId, projectId, environmentId, isTerraformFeatureFlag, showPylonForm]
  )

  const [searchInput, setSearchInput] = useState('')

  const filterService = ({ title }: { title: string }) => title.toLowerCase().includes(searchInput.toLowerCase())

  const handleSearchInputChange = (value: string) => {
    if ([...serviceEmpty, ...serviceTemplates].filter(filterService).length === 0) {
      posthog.capture('search-service', {
        qoveryServiceType: 'INPUT_SEARCH',
        searchValue: value,
      })
    }

    setSearchInput(value)
  }

  const emptyState = (
    <Section className="w-full">
      <Heading className="mb-1">You didn't find what you want?</Heading>
      <p className="mb-5 text-xs text-neutral-subtle">Use one of those options below.</p>

      <div className="grid grid-cols-3 gap-4">
        {[
          ...serviceEmpty,
          ...[
            {
              title: 'CloudFormation',
              description:
                'AWS CloudFormation is a service provided by Amazon Web Services that enables users to model and manage infrastructure resources in an automated and secure manner.',
              icon: (
                <img className="select-none" width={32} height={32} src={CloudFormationIcon} alt="CloudFormation" />
              ),
              link: getServicesPath(
                organizationId,
                projectId,
                environmentId,
                SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL('cloudformation', 'current')
              ),
              cloud_provider: cloudProvider,
            },
          ],
        ].map((service) => (
          <Card key={service.title} {...service} />
        ))}
      </div>
    </Section>
  )

  return (
    <>
      <div className="mb-10 flex flex-col text-center">
        <InputSearch
          autofocus
          placeholder="Search…"
          className="mx-auto mb-4 w-[360px]"
          customSize="h-9 text-xs rounded-full"
          onChange={handleSearchInputChange}
        />
        <ExternalLink
          className="mx-auto"
          href="https://www.qovery.com/docs/getting-started/basic-concepts#services"
          size="xs"
        >
          See documentation
        </ExternalLink>
      </div>
      <div className="mx-auto flex w-[1024px] flex-col gap-8">
        {searchInput.length === 0 ? (
          <>
            <Section>
              <Heading className="mb-1">Default Qovery services</Heading>
              <p className="mb-5 text-xs text-neutral-subtle">
                Services without pre-configuration. These are the basic blocks to deploy any technical stack.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {serviceEmpty.map((service) => (
                  <Card key={service.title} {...service} />
                ))}
              </div>
            </Section>
            <SectionByTag
              title="Data & Storage"
              description="Find your perfect data and storage template with presets."
              tag="DATA_STORAGE"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
            />
            <SectionByTag
              title="Back-end"
              description="Find your perfect Back-end template with presets."
              tag="BACK_END"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
            />
            <SectionByTag
              title="Front-end"
              description="Find your perfect Front-end template with presets."
              tag="FRONT_END"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
            />
            <Section>
              <Heading className="mb-1">IAC</Heading>
              <p className="mb-5 text-xs text-neutral-subtle">
                Deploy external cloud resources with Terraform or use IAC templates.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-4">
                {serviceEmpty
                  .filter((s) => s.title === 'Terraform')
                  .map((service) => (
                    <Card key={service.title} {...service} />
                  ))}
                {serviceTemplates
                  .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
                  .filter(({ tag: t }) => t === 'IAC')
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
                      onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
                      {...service}
                    />
                  ))}
              </div>
            </Section>
            <SectionByTag
              title="More template"
              description="Look for other template presets."
              tag="OTHER"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              isTerraformFeatureFlag={isTerraformFeatureFlag}
              onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
            />
          </>
        ) : [...serviceEmpty, ...serviceTemplates]
            .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
            .filter(filterService).length > 0 ? (
          <Section>
            <Heading className="mb-1">Search results</Heading>
            <p className="mb-5 text-xs text-neutral-subtle">
              Find the service you need to kickstart your next project.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[...serviceEmpty, ...serviceTemplates]
                .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
                .filter(filterService)
                .map((service) => (
                  <CardService
                    key={service.title}
                    availableTemplates={availableTemplates}
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    cloudProvider={cloudProvider}
                    isTerraformFeatureFlag={isTerraformFeatureFlag}
                    onUpgradePlanClick={() => showPylonForm('request-upgrade-plan')}
                    {...service}
                  />
                ))}
            </div>
          </Section>
        ) : (
          emptyState
        )}
      </div>
    </>
  )
}

import clsx from 'clsx'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type CloudProviderEnum, type LifecycleTemplateListResponseResultsInner } from 'qovery-typescript-axios'
import { type ReactElement, cloneElement, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_APPLICATION_TEMPLATE_CREATION_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_DATABASE_TEMPLATE_CREATION_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_HELM_TEMPLATE_CREATION_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL,
  SERVICES_TERRAFORM_CREATION_URL,
} from '@qovery/shared/routes'
import { Badge, Button, ExternalLink, Heading, Icon, InputSearch, Link, Section } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import {
  type ServiceTemplateOptionType,
  type ServiceTemplateType,
  type TagsEnum,
  serviceTemplates,
} from './service-templates'

const CloudFormationIcon = '/assets/devicon/cloudformation.svg'

const getEnvironmentBasePath = (organizationId: string, projectId: string, environmentId: string) =>
  `/organization/${organizationId}/project/${projectId}/environment/${environmentId}`

const getServicesPath = (organizationId: string, projectId: string, environmentId: string, subPath: string) =>
  `${getEnvironmentBasePath(organizationId, projectId, environmentId)}${subPath}`

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

    return (
      <Link to={link!} className={className}>
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

const servicePathSuffix = (type: ServiceType, parentSlug: string, slug: string) =>
  match(type)
    .with('APPLICATION', 'CONTAINER', () => SERVICES_APPLICATION_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('DATABASE', () => SERVICES_DATABASE_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('LIFECYCLE_JOB', () => SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('HELM', () => SERVICES_HELM_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('JOB', 'CRON_JOB', () => undefined)
    .with('TERRAFORM', () => undefined)
    .otherwise(() => undefined)

interface CardOptionProps extends ServiceTemplateOptionType {
  parentSlug: string
  organizationId: string
  projectId: string
  environmentId: string
}

function CardOption({
  parentSlug,
  slug,
  icon,
  title,
  description,
  type,
  recommended,
  organizationId,
  projectId,
  environmentId,
}: CardOptionProps) {
  const pathSuffix = servicePathSuffix(type, parentSlug, slug)
  const to = pathSuffix ? getServicesPath(organizationId, projectId, environmentId, pathSuffix) : undefined

  if (!to) return null

  return (
    <Link
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
        <span className="inline-block text-ssm font-medium text-neutral">
          {title}
          {recommended && (
            <span className="relative -top-0.5 ml-1 inline-block rounded bg-surface-brand-solid px-1 text-2xs text-neutralInvert">
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
}: Omit<ServiceTemplateType, 'cloud_provider'> & {
  cloud_provider?: CloudProviderEnum | string
  availableTemplates: LifecycleTemplateListResponseResultsInner[]
  organizationId: string
  projectId: string
  environmentId: string
  cloudProvider?: CloudProviderEnum | string
}) {
  const [expanded, setExpanded] = useState(false)

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
              <img className="select-none" width={52} height={52} src={icon as string} alt={title} />
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
                    parentSlug={slug!}
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
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
                <img className="max-h-10 w-14 select-none" src={icon} alt={title} />
              ) : (
                cloneElement(icon as ReactElement, { className: 'w-10' })
              )}
            </span>
          </>
        )}
      </div>
    )
  }

  const pathSuffix = link ?? servicePathSuffix(type!, slug!, 'current')
  const to = pathSuffix ? getServicesPath(organizationId, projectId, environmentId, pathSuffix) : undefined

  if (!to) return null

  return (
    <Link
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
          <img className="max-h-10 w-14 select-none" src={icon} alt={title} />
        ) : (
          cloneElement(icon as ReactElement, { className: 'w-10' })
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
}: {
  title: string
  tag: keyof typeof TagsEnum
  cloudProvider?: CloudProviderEnum | string
  description?: string
  availableTemplates: LifecycleTemplateListResponseResultsInner[]
  organizationId: string
  projectId: string
  environmentId: string
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
        link: getServicesPath(organizationId, projectId, environmentId, SERVICES_APPLICATION_CREATION_URL),
        cloud_provider: cloudProvider,
      },
      {
        title: 'Database',
        description: 'Easy and fastest way to deploy the most popular databases.',
        icon: <Icon name="DATABASE" width={32} height={32} />,
        link: getServicesPath(organizationId, projectId, environmentId, SERVICES_DATABASE_CREATION_URL),
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
            />
            <SectionByTag
              title="IAC"
              description="Find your perfect IAC template with presets."
              tag="IAC"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
            />
            <SectionByTag
              title="More template"
              description="Look for other template presets."
              tag="OTHER"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
            />
          </>
        ) : [...serviceEmpty, ...serviceTemplates]
            .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
            .filter((c) => !('tag' in c && 'slug' in c && c.tag === 'IAC' && c.slug === 'terraform'))
            .filter(filterService).length > 0 ? (
          <Section>
            <Heading className="mb-1">Search results</Heading>
            <p className="mb-5 text-xs text-neutral-subtle">
              Find the service you need to kickstart your next project.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[...serviceEmpty, ...serviceTemplates]
                .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
                .filter((c) => !('tag' in c && 'slug' in c && c.tag === 'IAC' && c.slug === 'terraform'))
                .filter(filterService)
                .map((service) => (
                  <CardService
                    key={service.title}
                    availableTemplates={availableTemplates}
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    cloudProvider={cloudProvider}
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

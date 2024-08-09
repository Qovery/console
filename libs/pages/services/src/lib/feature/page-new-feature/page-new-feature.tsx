import clsx from 'clsx'
import TerraformIcon from 'devicon/icons/terraform/terraform-original.svg'
import posthog from 'posthog-js'
import { type CloudProviderEnum, type LifecycleTemplateListResponseResultsInner } from 'qovery-typescript-axios'
import { type ReactElement, cloneElement, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment, useLifecycleTemplates } from '@qovery/domains/environments/feature'
import { type ServiceType } from '@qovery/domains/services/data-access'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_APPLICATION_TEMPLATE_CREATION_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_DATABASE_TEMPLATE_CREATION_URL,
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_HELM_TEMPLATE_CREATION_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Button, ExternalLink, Heading, Icon, InputSearch, Link, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import {
  type ServiceTemplateOptionType,
  type ServiceTemplateType,
  type TagsEnum,
  serviceTemplates,
} from './service-templates'

const CloudFormationIcon = '/assets/devicon/cloudformation.svg'

function Card({
  title,
  description,
  icon,
  link,
}: {
  title: string
  description: string
  icon: ReactElement
  link: string
}) {
  return (
    <NavLink
      to={link}
      className="flex items-center gap-5 rounded border border-neutral-200 px-5 py-4 shadow-sm transition hover:bg-neutral-100"
    >
      <div>
        <h3 className="mb-1 text-ssm font-medium">{title}</h3>
        <p className="max-w-96 text-xs text-neutral-350">{description}</p>
      </div>
      {icon}
    </NavLink>
  )
}

const servicePath = (type: ServiceType, parentSlug: string, slug: string) =>
  match(type)
    .with('APPLICATION', 'CONTAINER', () => SERVICES_APPLICATION_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('DATABASE', () => SERVICES_DATABASE_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('LIFECYCLE_JOB', () => SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('HELM', () => SERVICES_HELM_TEMPLATE_CREATION_URL(parentSlug, slug))
    .with('JOB', 'CRON_JOB', () => undefined)
    .exhaustive()

interface CardOptionProps extends ServiceTemplateOptionType {
  parentSlug: string
}

function CardOption({ parentSlug, slug, icon, title, description, type, recommended }: CardOptionProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  return (
    <NavLink
      to={SERVICES_URL(organizationId, projectId, environmentId) + servicePath(type, parentSlug, slug)}
      className="flex items-start gap-3 rounded-sm border border-neutral-200 p-3 transition hover:bg-white"
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
        <span className="inline-block text-ssm font-medium text-neutral-400">
          {title}
          {recommended && (
            <span className="relative -top-0.5 ml-1 inline-block rounded bg-brand-500 px-1 text-2xs text-neutral-50">
              Fastest
            </span>
          )}
        </span>
        <span className="inline-block text-xs text-neutral-350">{description}</span>
      </span>
      <span className="flex h-full items-center pr-1">
        <Icon iconName="chevron-right" className="text-xs text-neutral-400" />
      </span>
    </NavLink>
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
}: ServiceTemplateType & {
  availableTemplates: LifecycleTemplateListResponseResultsInner[]
}) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const [expanded, setExpanded] = useState(false)
  const { data: environment } = useEnvironment({ environmentId })
  const cloudProvider = environment?.cloud_provider.provider as CloudProviderEnum

  if (options) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className={clsx({
          'flex cursor-pointer  items-center gap-6 rounded border border-neutral-200 p-5 shadow-sm transition hover:bg-neutral-100':
            true,
          'col-span-3 bg-neutral-100 p-6': expanded,
        })}
      >
        {expanded ? (
          <div className="flex w-full flex-col gap-8">
            <div className="relative flex gap-6">
              <img className="select-none" width={52} height={52} src={icon as string} alt={title} />
              <div>
                <h3 className="mb-1 text-base font-medium">{title}</h3>
                <p className="max-w-96 text-ssm text-neutral-350">{description}</p>
              </div>
              <Button
                className="absolute right-0 top-0"
                color="neutral"
                variant="surface"
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
                    // Iterate on all available templates to find the matching one
                    // If there isn't, it means that no template is available so entry must be exclude
                    return availableTemplates.reduce((acc, template) => c.template_id === template.id || acc, false)
                  } else {
                    return true
                  }
                })
                .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
                .sort((a, b) => {
                  if (a.recommended && !b.recommended) return -1
                  if (!a.recommended && b.recommended) return 1
                  return a.title.localeCompare(b.title)
                })
                .map((props) => (
                  <CardOption key={props.slug} parentSlug={slug!} {...props} />
                ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-full w-60 flex-col justify-between gap-2">
              <div>
                <h3 className="mb-1 text-ssm font-medium">{title}</h3>
                <p className="text-xs text-neutral-350">{description}</p>
              </div>
              <p className="text-xs font-medium text-neutral-400">
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

  return (
    <NavLink
      to={link ?? SERVICES_URL(organizationId, projectId, environmentId) + servicePath(type!, slug!, 'current')}
      className="flex gap-6 rounded border border-neutral-200 p-5 shadow-sm transition hover:bg-neutral-100"
      onClick={() =>
        posthog.capture('select-service', {
          qoveryServiceType: type,
          selectedServiceSubType: slug,
        })
      }
    >
      <div className="w-60">
        <h3 className="mb-1 text-ssm font-medium">{title}</h3>
        <p className="text-xs text-neutral-350">{description}</p>
      </div>
      <div className="flex items-center">
        {typeof icon === 'string' ? (
          <img className="max-h-10 w-14 select-none" src={icon} alt={title} />
        ) : (
          cloneElement(icon as ReactElement, { className: 'w-10' })
        )}
      </div>
    </NavLink>
  )
}

function SectionByTag({
  title,
  description,
  tag,
  cloudProvider,
  availableTemplates,
}: {
  title: string
  tag: keyof typeof TagsEnum
  cloudProvider?: CloudProviderEnum
  description?: string
  availableTemplates: LifecycleTemplateListResponseResultsInner[]
}) {
  return (
    <Section>
      <Heading className="mb-1">{title}</Heading>
      {description && <p className="text-xs text-neutral-350">{description}</p>}
      <div className="mt-5 grid grid-cols-3 gap-4">
        {serviceTemplates
          .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
          .filter(({ tag: t }) => t === tag)
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((service) => (
            <CardService key={service.title} availableTemplates={availableTemplates} {...service} />
          ))}
      </div>
    </Section>
  )
}

export function PageNewFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  useDocumentTitle('Create new service - Qovery')

  const { data: environment } = useEnvironment({ environmentId })
  const { data: availableTemplates = [] } = useLifecycleTemplates({ environmentId })

  const cloudProvider = environment?.cloud_provider.provider as CloudProviderEnum

  const serviceEmpty = [
    {
      title: 'Application',
      description: 'Deploy a long running service running from Git or a Container Registry.',
      icon: <Icon name="APPLICATION" width={32} height={32} />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_APPLICATION_CREATION_URL,
      cloud_provider: cloudProvider,
    },
    {
      title: 'Database',
      description: 'Easy and fastest way to deploy the most popular databases.',
      icon: <Icon name="DATABASE" width={32} height={32} />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DATABASE_CREATION_URL,
      cloud_provider: cloudProvider,
    },
    {
      title: 'Lifecycle Job',
      description: 'Execute any type of script coming from Git or a Container Registry.',
      icon: <Icon name="LIFECYCLE_JOB" width={32} height={32} />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_LIFECYCLE_CREATION_URL,
      cloud_provider: cloudProvider,
    },
    {
      title: 'Cron Job',
      description: 'Execute any type of script at a regular basis.',
      icon: <Icon name="CRON_JOB" width={32} height={32} />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_CRONJOB_CREATION_URL,
      cloud_provider: cloudProvider,
    },
    {
      title: 'Helm',
      description: 'Deploy a Helm Chart on your Kubernetes cluster.',
      icon: <Icon name="HELM" width={32} height={32} />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_HELM_CREATION_URL,
      cloud_provider: cloudProvider,
    },
  ]

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
      <p className="mb-5 text-xs text-neutral-350">Use one of those options below.</p>

      <div className="grid grid-cols-3 gap-4">
        {[
          ...serviceEmpty,
          ...[
            {
              title: 'Terraform',
              description: 'Terraform is an open-source infrastructure as code software tool.',
              icon: <img className="select-none" width={32} height={32} src={TerraformIcon} alt="Terraform" />,
              link:
                SERVICES_URL(organizationId, projectId, environmentId) +
                SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL('terraform', 'current'),
              cloud_provider: cloudProvider,
            },
            {
              title: 'CloudFormation',
              description:
                'AWS CloudFormation is a service provided by Amazon Web Services that enables users to model and manage infrastructure resources in an automated and secure manner.',
              icon: (
                <img className="select-none" width={32} height={32} src={CloudFormationIcon} alt="CloudFormation" />
              ),
              link:
                SERVICES_URL(organizationId, projectId, environmentId) +
                SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL('cloudformation', 'current'),
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
    <Section className="flex w-full flex-1 flex-col gap-8 rounded-t bg-white p-8 pb-24">
      <Link
        color="brand"
        to={SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL}
        className="text-sm"
      >
        <Icon iconName="arrow-left" className="mr-1" />
        Back to services list
      </Link>
      <div className="flex flex-col text-center">
        <Heading className="mb-2 text-2xl">Create new service</Heading>
        <p className="mb-4 text-sm text-neutral-350">
          Step into the Qovery service and embrace the power of collaboration to kickstart your next project.
        </p>
        <InputSearch
          autofocus
          placeholder="Search..."
          className="mx-auto mb-4 w-[360px]"
          customSize="h-9 text-xs rounded-full"
          onChange={handleSearchInputChange}
        />
        <ExternalLink
          className="mx-auto"
          href="https://hub.qovery.com/docs/getting-started/basic-concepts/#service"
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
              <p className="mb-5 text-xs text-neutral-350">
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
            />
            <SectionByTag
              title="Back-end"
              description="Find your perfect Back-end template with presets."
              tag="BACK_END"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
            />
            <SectionByTag
              title="Front-end"
              description="Find your perfect Front-end template with presets."
              tag="FRONT_END"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
            />
            <SectionByTag
              title="IAC"
              description="Find your perfect IAC template with presets."
              tag="IAC"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
            />
            <SectionByTag
              title="More template"
              description="Look for other template presets."
              tag="OTHER"
              cloudProvider={cloudProvider}
              availableTemplates={availableTemplates}
            />
          </>
        ) : [...serviceEmpty, ...serviceTemplates]
            .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
            .filter(filterService).length > 0 ? (
          <Section>
            <Heading className="mb-1">Search results</Heading>
            <p className="mb-5 text-xs text-neutral-350">Find the service you need to kickstart your next project.</p>
            <div className="grid grid-cols-3 gap-4">
              {[...serviceEmpty, ...serviceTemplates]
                .filter((c) => c.cloud_provider === cloudProvider || !c.cloud_provider)
                .filter(filterService)
                .map((service) => (
                  <CardService key={service.title} availableTemplates={availableTemplates} {...service} />
                ))}
            </div>
          </Section>
        ) : (
          emptyState
        )}
      </div>
    </Section>
  )
}

export default PageNewFeature

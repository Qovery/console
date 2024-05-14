import clsx from 'clsx'
import { type ReactElement, cloneElement, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { ExternalLink, Heading, Icon, InputSearch, Link, RadioGroup, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type ServiceTemplateType, serviceTemplates } from './service-templates'

function Card({ title, icon, link }: ServiceTemplateType) {
  return (
    <NavLink
      to={link ?? '.'}
      className="flex items-center gap-3 border border-neutral-200 hover:bg-neutral-100 transition rounded p-3 shadow-sm"
    >
      {icon}
      <h3 className="text-ssm font-medium">{title}</h3>
    </NavLink>
  )
}

function CardService({ title, icon, description, link, slug, options }: ServiceTemplateType) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const [expanded, setExpanded] = useState(false)

  if (options) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className={clsx({
          'flex gap-6 border border-neutral-200 hover:bg-neutral-100 transition rounded p-5 shadow-sm': true,
          'col-span-3 min-h-60 p-6 bg-neutral-100': expanded,
        })}
      >
        {expanded ? (
          <div className="flex flex-col gap-8 w-full">
            <div className="flex gap-6">
              <img className="select-none" width={52} height={52} src={icon as string} alt={title} />
              <div>
                <h3 className="text-base font-medium mb-1">{title}</h3>
                <p className="text-ssm text-neutral-350 max-w-96">{description}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {options
                .sort((a, b) => a.title.localeCompare(b.title))
                .map(({ slug: slugItem, title, description, icon }) => (
                  <NavLink
                    key={slugItem}
                    to={
                      SERVICES_URL(organizationId, projectId, environmentId) +
                      SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL(slug)
                    }
                    className="flex items-start gap-3 border border-neutral-200 p-3 rounded-sm hover:bg-white transition"
                  >
                    <img className="select-none mt-1" width={24} height={24} src={icon} alt={title} />
                    <span>
                      <span className="inline-block text-ssm text-neutral-400 font-medium">{title}</span>
                      <span className="inline-block text-xs text-neutral-350">{description}</span>
                    </span>
                    <span className="flex items-center h-full pr-1">
                      <Icon iconName="chevron-right" className="text-xs text-neutral-400" />
                    </span>
                  </NavLink>
                ))}
            </div>
          </div>
        ) : (
          <>
            <div className="w-60">
              <h3 className="text-ssm font-medium mb-1">{title}</h3>
              <p className="text-xs text-neutral-350">{description}</p>
            </div>
            {typeof icon === 'string' ? (
              <img className="select-none" width={40} height={40} src={icon} alt={title} />
            ) : (
              cloneElement(icon as ReactElement, { className: 'w-10' })
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={
        link ?? SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL(slug)
      }
      className="flex gap-6 border border-neutral-200 hover:bg-neutral-100 transition rounded p-5 shadow-sm"
    >
      <div className="w-60">
        <h3 className="text-ssm font-medium mb-1">{title}</h3>
        <p className="text-xs text-neutral-350">{description}</p>
      </div>
      {typeof icon === 'string' ? (
        <img className="select-none" width={40} height={40} src={icon} alt={title} />
      ) : (
        cloneElement(icon as ReactElement, { className: 'w-10' })
      )}
    </NavLink>
  )
}

export function PageNewFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  useDocumentTitle('Create new service - Qovery')

  const serviceEmpty = [
    {
      title: 'Application',
      description: 'Create from empty application git or container based.',
      icon: <Icon name="APPLICATION" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_APPLICATION_CREATION_URL,
    },
    {
      title: 'Database',
      description: 'Create from empty database managed or container.',
      icon: <Icon name="DATABASE" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DATABASE_CREATION_URL,
    },
    {
      title: 'Lifecycle Job',
      description: 'Create an empty lifecycle job.',
      icon: <Icon name="LIFECYCLE_JOB" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_LIFECYCLE_CREATION_URL,
    },
    {
      title: 'Cron Job',
      description: 'Create an empty cron job.',
      icon: <Icon name="CRON_JOB" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_CRONJOB_CREATION_URL,
    },
    {
      title: 'Helm',
      description: 'Create an empty Helm chart.',
      icon: <Icon name="HELM" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_HELM_CREATION_URL,
    },
  ]

  const [searchInput, setSearchInput] = useState('')

  const handleSearchInputChange = (value: string) => setSearchInput(value)
  const filterService = ({ title }: { title: string }) => title.toLowerCase().includes(searchInput.toLowerCase())

  const emptyState = (
    <div className="text-center w-full">
      <Icon iconName="wave-pulse" className="text-neutral-350" />
      <p className="text-neutral-350 font-medium text-xs mt-1">No result for this search</p>
    </div>
  )

  return (
    <Section className="bg-white flex flex-col gap-8 flex-1 rounded-t w-full p-8 pb-24">
      <Link color="brand" to=".." className="text-sm">
        <Icon iconName="arrow-left" className="mr-1" />
        Back to services list
      </Link>
      <div className="flex flex-col text-center">
        <Heading className="text-2xl mb-2">Create new service</Heading>
        <p className="text-neutral-350 text-sm mb-4">
          Step into the Qovery service and embrace the power of collaboration to kickstart your next project.
        </p>
        <InputSearch
          autofocus
          placeholder="Search..."
          className="w-[360px] mx-auto mb-4"
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
      <div className="flex flex-col gap-8 w-[1024px] mx-auto">
        {searchInput.length === 0 ? (
          <>
            <Section>
              <Heading className="mb-1">Select an empty service</Heading>
              <p className="text-neutral-350 text-xs mb-5">Services without pre-configuration for technical stack.</p>
              <div className="grid grid-cols-5 gap-3">
                {serviceEmpty.map((service) => (
                  <Card key={service.title} {...service} />
                ))}
              </div>
            </Section>
            <Section>
              <Heading className="mb-1">Select your service</Heading>
              <p className="text-neutral-350 text-xs mb-5">
                Jumpstart your app development process with pre-built solutions from Qovery.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {serviceTemplates
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((service) => (
                    <CardService key={service.title} {...service} />
                  ))}
              </div>
            </Section>
          </>
        ) : [...serviceEmpty, ...serviceTemplates].filter(filterService).length > 0 ? (
          <Section>
            <Heading className="mb-1">Search results</Heading>
            <p className="text-neutral-350 text-xs mb-5">Find the service you need to kickstart your next project.</p>
            <div className="grid grid-cols-3 gap-4">
              {[...serviceEmpty, ...serviceTemplates].filter(filterService).map((service) => (
                <CardService key={service.title} {...service} />
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

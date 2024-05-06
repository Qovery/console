import { useDocumentTitle } from '@uidotdev/usehooks'
import { type ReactNode, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { EmptyState, ExternalLink, Heading, Icon, InputSearch, Link, Section } from '@qovery/shared/ui'
import { serviceTemplates } from './service-templates'

function Card({ title, icon, link }: { title: string; icon: ReactNode; link: string }) {
  return (
    <NavLink
      to={link}
      className="flex items-center gap-3 border border-neutral-200 hover:bg-neutral-100 transition rounded p-3 shadow-sm"
    >
      {icon}
      <h3 className="text-ssm font-medium">{title}</h3>
    </NavLink>
  )
}

function CardService({ title, description, iconUrl }: { title: string; description: string; iconUrl: string }) {
  return (
    <NavLink
      to="."
      className="flex gap-6 border border-neutral-200 hover:bg-neutral-100 transition rounded p-5 shadow-sm"
    >
      <div className="w-60">
        <h3 className="text-ssm font-medium mb-1">{title}</h3>
        <p className="text-xs text-neutral-350">{description}</p>
      </div>
      <img className="select-none" width={40} height={40} src={iconUrl} alt={title} />
    </NavLink>
  )
}

export function PageNewFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  useDocumentTitle('Create new service - Qovery')

  const serviceEmpty = [
    {
      title: 'Application',
      icon: <Icon name="APPLICATION" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_APPLICATION_CREATION_URL,
    },
    {
      title: 'Database',
      icon: <Icon name="DATABASE" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DATABASE_CREATION_URL,
    },
    {
      title: 'Lifecycle Job',
      icon: <Icon name="LIFECYCLE_JOB" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_LIFECYCLE_CREATION_URL,
    },
    {
      title: 'Cron Job',
      icon: <Icon name="CRON_JOB" />,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_CRONJOB_CREATION_URL,
    },
    {
      title: 'Helm',
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
        <Section>
          <Heading className="mb-1">Select an empty service</Heading>
          <p className="text-neutral-350 text-xs mb-5">Services without pre-configuration for technical stack.</p>
          {serviceEmpty.filter(filterService).length > 0 ? (
            <div className="grid grid-cols-5 gap-3">
              {serviceEmpty.filter(filterService).map((service) => (
                <Card key={service.title} {...service} />
              ))}
            </div>
          ) : (
            emptyState
          )}
        </Section>
        <Section>
          <Heading className="mb-1">Select your service</Heading>
          <p className="text-neutral-350 text-xs mb-5">
            Jumpstart your app development process with pre-built solutions from Qovery.
          </p>
          {serviceTemplates.filter(filterService).length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {serviceTemplates
                .filter(filterService)
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((service) => (
                  <CardService key={service.title} {...service} />
                ))}
            </div>
          ) : (
            emptyState
          )}
        </Section>
      </div>
    </Section>
  )
}

export default PageNewFeature

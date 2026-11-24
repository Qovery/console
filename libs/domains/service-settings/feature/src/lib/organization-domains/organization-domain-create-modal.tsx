import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { useLinks, useService } from '@qovery/domains/services/feature'
import { Button, InputSelect } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { ServiceDomainCrudModal } from '../service-domain-settings/service-domain-crud-modal/service-domain-crud-modal'

export interface OrganizationDomainCreateModalProps {
  onClose: () => void
}

export function OrganizationDomainCreateModal({ onClose }: OrganizationDomainCreateModalProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const [projectId, setProjectId] = useState('')
  const [environmentId, setEnvironmentId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [continueToEditor, setContinueToEditor] = useState(false)
  const { data: projects = [] } = useQuery(queries.projects.list({ organizationId }))
  const { data: environments = [] } = useQuery({
    ...queries.environments.list({ projectId }),
    enabled: Boolean(projectId),
  })
  const { data: services = [] } = useQuery({ ...queries.services.list(environmentId), enabled: Boolean(environmentId) })
  const availableServices = services.filter((service) =>
    ['APPLICATION', 'CONTAINER', 'HELM'].includes(service.serviceType)
  )
  const { data: service, isError: serviceError } = useService({ environmentId, serviceId })
  const { data: links = [], isLoading: linksLoading } = useLinks({ serviceId, serviceType: service?.serviceType })
  const canCreate = Boolean(service && !linksLoading && links.length)

  if (
    continueToEditor &&
    service &&
    (service.serviceType === 'APPLICATION' || service.serviceType === 'CONTAINER' || service.serviceType === 'HELM')
  ) {
    return (
      <ServiceDomainCrudModal
        organizationId={organizationId}
        projectId={projectId}
        service={service}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="p-6">
      <h2 className="h4 text-neutral">New domain</h2>
      <p className="mb-6 mt-2 text-sm text-neutral-subtle">Choose the service for this domain.</p>
      <div className="space-y-4">
        <InputSelect
          label="Project"
          value={projectId}
          options={projects.map(({ id, name }) => ({ label: name, value: id }))}
          onChange={(value) => {
            setProjectId(String(value))
            setEnvironmentId('')
            setServiceId('')
          }}
        />
        <InputSelect
          label="Environment"
          value={environmentId}
          disabled={!projectId}
          options={environments.map(({ id, name }) => ({ label: name, value: id }))}
          onChange={(value) => {
            setEnvironmentId(String(value))
            setServiceId('')
          }}
        />
        <InputSelect
          label="Service"
          value={serviceId}
          disabled={!environmentId}
          options={availableServices.map(({ id, name }) => ({ label: name, value: id }))}
          onChange={(value) => {
            setServiceId(String(value))
            setContinueToEditor(false)
          }}
        />
        {serviceError ? (
          <p role="alert" className="text-sm text-negative">
            Unable to load the service domain configuration. Close this dialog and try again.
          </p>
        ) : null}

        {service && !linksLoading && !links.length ? (
          <p className="text-sm text-neutral-subtle">Configure a public port on this service before adding a domain.</p>
        ) : null}
        <Button variant="outline" color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!canCreate} onClick={() => setContinueToEditor(true)}>
          Continue
        </Button>
      </div>
    </div>
  )
}

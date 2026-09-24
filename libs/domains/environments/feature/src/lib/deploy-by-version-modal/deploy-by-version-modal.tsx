import { type Environment } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { Button, Icon, LoaderSpinner, useModal } from '@qovery/shared/ui'
import { useDeployAllServices } from '../hooks/use-deploy-all-services/use-deploy-all-services'
import {
  type DeployByVersionService,
  type ServiceVersionSelections,
  buildDeployByVersionPayload,
  countDeployByVersionServices,
  createInitialSelections,
} from './deploy-by-version'
import { ServiceVersionRow } from './service-version-row'
import { useDeployByVersionServices } from './use-deploy-by-version-services'

export interface DeployByVersionModalProps {
  environment: Environment
}

function ServiceSection({
  title,
  services,
  selections,
  action,
  onToggle,
  onVersionChange,
}: {
  title: string
  services: DeployByVersionService[]
  selections: ServiceVersionSelections
  action?: React.ReactNode
  onToggle: (serviceId: string) => void
  onVersionChange: (serviceId: string, version: string) => void
}) {
  if (services.length === 0) return null

  return (
    <section className="mb-6 last:mb-0">
      <div className="mb-2 flex min-h-6 items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-subtle">
          {services.length} {title}
        </h3>
        {action}
      </div>
      <ul>
        {services.map((service) => (
          <ServiceVersionRow
            key={service.id}
            service={service}
            selection={selections[service.id]}
            onToggle={() => onToggle(service.id)}
            onVersionChange={(version) => onVersionChange(service.id, version)}
          />
        ))}
      </ul>
    </section>
  )
}

function DeployByVersionHeader() {
  return (
    <div className="mb-6">
      <h2 className="mb-1 text-lg font-medium text-neutral">Deploy by version</h2>
      <p className="text-sm text-neutral-subtle">
        Select the service and choose a specific version to deploy on each of those
      </p>
    </div>
  )
}

function DeployByVersionForm({
  environment,
  services,
}: DeployByVersionModalProps & { services: DeployByVersionService[] }) {
  const { closeModal } = useModal()
  const { mutate: deployAllServices, isLoading } = useDeployAllServices()
  const [selections, setSelections] = useState<ServiceVersionSelections>(() => createInitialSelections(services))

  const outdatedServices = services.filter(
    (service) => service.versions[0]?.value && service.versions[0].value !== service.currentVersion
  )
  const upToDateServices = services.filter(
    (service) => service.versions[0]?.value && service.versions[0].value === service.currentVersion
  )
  const payload = useMemo(() => buildDeployByVersionPayload(services, selections), [selections, services])
  const selectedCount = countDeployByVersionServices(payload)
  const allOutdatedSelected = outdatedServices
    .filter(({ isSkipped }) => !isSkipped)
    .every(({ id }) => selections[id].selected)

  const toggleService = (serviceId: string) => {
    setSelections((current) => ({
      ...current,
      [serviceId]: { ...current[serviceId], selected: !current[serviceId].selected },
    }))
  }

  const changeVersion = (serviceId: string, version: string) => {
    setSelections((current) => ({
      ...current,
      [serviceId]: { ...current[serviceId], selected: true, version },
    }))
  }

  const toggleOutdatedServices = () => {
    setSelections((current) =>
      Object.fromEntries(
        Object.entries(current).map(([serviceId, selection]) => {
          const service = outdatedServices.find(({ id }) => id === serviceId)
          return [
            serviceId,
            service && !service.isSkipped ? { ...selection, selected: !allOutdatedSelected } : selection,
          ]
        })
      )
    )
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedCount === 0) return
    deployAllServices({ environment, payload }, { onSuccess: closeModal })
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="p-6" data-testid="modal-main-content">
        <DeployByVersionHeader />
        <ServiceSection
          title={outdatedServices.length === 1 ? 'outdated service' : 'outdated services'}
          services={outdatedServices}
          selections={selections}
          action={
            outdatedServices.some(({ isSkipped }) => !isSkipped) ? (
              <Button type="button" size="xs" variant="outline" color="neutral" onClick={toggleOutdatedServices}>
                {allOutdatedSelected ? 'Unselect all' : 'Select all'}
              </Button>
            ) : undefined
          }
          onToggle={toggleService}
          onVersionChange={changeVersion}
        />
        <ServiceSection
          title={upToDateServices.length === 1 ? 'up to date service' : 'up to date services'}
          services={upToDateServices}
          selections={selections}
          onToggle={toggleService}
          onVersionChange={changeVersion}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-neutral px-5 py-4">
        <Button type="button" color="neutral" variant="plain" size="lg" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={selectedCount === 0} loading={isLoading}>
          {selectedCount === 0
            ? 'No services to update'
            : `Update ${selectedCount} service${selectedCount === 1 ? '' : 's'}`}
        </Button>
      </div>
    </form>
  )
}

export function DeployByVersionModal({ environment }: DeployByVersionModalProps) {
  const { closeModal } = useModal()
  const {
    data: services,
    isLoading,
    isError,
  } = useDeployByVersionServices({
    environmentId: environment.id,
    organizationId: environment.organization.id,
  })
  const servicesWithVersions = services.filter(({ versions }) => versions.length > 0)
  const hasVersionErrors = services.some(({ hasVersionError }) => hasVersionError)

  const formKey = servicesWithVersions
    .map(({ id, currentVersion, isSkipped, versions }) => `${id}:${currentVersion}:${versions[0]?.value}:${isSkipped}`)
    .join('|')

  if (!isLoading && !isError && servicesWithVersions.length > 0) {
    return <DeployByVersionForm key={formKey} environment={environment} services={servicesWithVersions} />
  }

  return (
    <div className="p-6" data-testid="modal-main-content">
      <DeployByVersionHeader />
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <LoaderSpinner />
        </div>
      ) : isError || (servicesWithVersions.length === 0 && hasVersionErrors) ? (
        <div className="py-10 text-center">
          <Icon iconName="circle-exclamation" className="text-negative" />
          <p className="mt-2 text-sm font-medium text-neutral">Service versions could not be loaded.</p>
          <p className="mt-1 text-xs text-neutral-subtle">Close the modal and try again.</p>
          <Button type="button" className="mt-4" color="neutral" variant="outline" size="sm" onClick={closeModal}>
            Close
          </Button>
        </div>
      ) : servicesWithVersions.length === 0 ? (
        <div className="py-10 text-center" data-testid="empty-state">
          <Icon iconName="check-circle" className="text-positive" />
          <p className="mt-2 text-sm font-medium text-neutral">No services support version selection.</p>
          <p className="mt-1 text-xs text-neutral-subtle">
            Blueprint, database, Argo CD, and agentic workflow services are not included.
          </p>
          <Button type="button" className="mt-4" color="neutral" variant="outline" size="sm" onClick={closeModal}>
            Close
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default DeployByVersionModal

import { type DeployAllRequest, type Environment } from 'qovery-typescript-axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { Button, Icon, LoaderSpinner, ScrollShadowWrapper, Truncate, useModal } from '@qovery/shared/ui'
import { useDeployAllServices } from '../hooks/use-deploy-all-services/use-deploy-all-services'
import {
  type ServiceForDeploy,
  type ServiceVersionInfo,
  useServicesForDeploy,
} from '../hooks/use-services-for-deploy/use-services-for-deploy'
import { ServiceVersionRow, type ServiceVersionSelection } from './service-version-row'

export interface DeployWithVersionModalProps {
  environment: Environment
}

type ServiceSelectionState = Map<string, ServiceVersionSelection>

function buildDeployAllPayload(selections: ServiceVersionSelection[]): DeployAllRequest {
  const payload: DeployAllRequest = {
    applications: [],
    containers: [],
    jobs: [],
    helms: [],
    databases: [],
  }

  for (const service of selections) {
    if (!service.isSelected) continue

    match(service.serviceType)
      .with('APPLICATION', () => {
        payload.applications!.push({
          application_id: service.id,
          git_commit_id: service.selectedVersion?.value,
        })
      })
      .with('CONTAINER', () => {
        payload.containers!.push({
          id: service.id,
          image_tag: service.selectedVersion?.value,
        })
      })
      .with('JOB', () => {
        const isGitSource = service.sourceType === 'git'
        payload.jobs!.push({
          id: service.id,
          git_commit_id: isGitSource ? service.selectedVersion?.value : undefined,
          image_tag: !isGitSource ? service.selectedVersion?.value : undefined,
        })
      })
      .with('HELM', () => {
        const isGitSource = service.sourceType === 'git'
        payload.helms!.push({
          id: service.id,
          chart_version: !isGitSource ? service.selectedVersion?.value : undefined,
          git_commit_id: isGitSource ? service.selectedVersion?.value : undefined,
        })
      })
      .with('DATABASE', () => {
        payload.databases!.push(service.id)
      })
      .with('TERRAFORM', () => {
        // Terraform is not supported in DeployAllRequest yet
        // This is a placeholder for future support
      })
      // CRON_JOB and LIFECYCLE_JOB are handled by the JOB case since API returns 'JOB'
      .otherwise(() => {
        // No-op for unhandled service types
      })
  }

  // Remove empty arrays to keep payload clean
  if (payload.applications?.length === 0) delete payload.applications
  if (payload.containers?.length === 0) delete payload.containers
  if (payload.jobs?.length === 0) delete payload.jobs
  if (payload.helms?.length === 0) delete payload.helms
  if (payload.databases?.length === 0) delete payload.databases

  return payload
}

function initializeSelections(services: ServiceForDeploy[]): ServiceSelectionState {
  return new Map(
    services.map((service) => [
      service.id,
      {
        ...service,
        isSelected: false,
        selectedVersion: undefined,
      },
    ])
  )
}

export function DeployWithVersionModal({ environment }: DeployWithVersionModalProps) {
  const { closeModal } = useModal()
  const { data: services, isLoading: isLoadingServices } = useServicesForDeploy({
    environmentId: environment.id,
  })
  const { mutate: deployAllServices, isLoading: isDeploying } = useDeployAllServices()

  const [selections, setSelections] = useState<ServiceSelectionState>(new Map())

  // Initialize selections when services are loaded
  useEffect(() => {
    if (services.length > 0 && selections.size === 0) {
      setSelections(initializeSelections(services))
    }
  }, [services, selections.size])

  const selectedServices = useMemo(() => Array.from(selections.values()).filter((s) => s.isSelected), [selections])

  const selectedCount = selectedServices.length
  const totalCount = services.length

  const handleToggle = useCallback((serviceId: string) => {
    setSelections((prev) => {
      const newSelections = new Map(prev)
      const service = newSelections.get(serviceId)
      if (service) {
        newSelections.set(serviceId, {
          ...service,
          isSelected: !service.isSelected,
        })
      }
      return newSelections
    })
  }, [])

  const handleVersionChange = useCallback((serviceId: string, version: ServiceVersionInfo | undefined) => {
    setSelections((prev) => {
      const newSelections = new Map(prev)
      const service = newSelections.get(serviceId)
      if (service) {
        newSelections.set(serviceId, {
          ...service,
          selectedVersion: version,
        })
      }
      return newSelections
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelections((prev) => {
      const newSelections = new Map(prev)
      newSelections.forEach((service, id) => {
        newSelections.set(id, { ...service, isSelected: true })
      })
      return newSelections
    })
  }, [])

  const handleDeselectAll = useCallback(() => {
    setSelections((prev) => {
      const newSelections = new Map(prev)
      newSelections.forEach((service, id) => {
        newSelections.set(id, { ...service, isSelected: false })
      })
      return newSelections
    })
  }, [])

  const handleSubmit = () => {
    if (selectedCount === 0) return

    const payload = buildDeployAllPayload(selectedServices)
    deployAllServices({ environment, payload })
    closeModal()
  }

  // Group services by type for display
  const servicesByType = useMemo(() => {
    const groups: Record<string, ServiceVersionSelection[]> = {
      APPLICATION: [],
      CONTAINER: [],
      JOB: [],
      HELM: [],
      DATABASE: [],
      TERRAFORM: [],
    }

    Array.from(selections.values()).forEach((service) => {
      groups[service.serviceType].push(service)
    })

    return groups
  }, [selections])

  const groupLabels: Record<string, string> = {
    APPLICATION: 'Applications',
    CONTAINER: 'Containers',
    JOB: 'Jobs',
    HELM: 'Helm Charts',
    DATABASE: 'Databases',
    TERRAFORM: 'Terraform',
  }

  return (
    <div className="p-6">
      <h2 className="h4 mb-1 max-w-sm truncate text-neutral-400 dark:text-neutral-50">Deploy with version selection</h2>
      <p className="mb-4 text-sm text-neutral-350 dark:text-neutral-50">
        Select services and choose specific versions to deploy
      </p>

      <div className="mb-4 flex items-center justify-between text-sm text-neutral-400 dark:text-neutral-50">
        <p>
          For{' '}
          <strong className="font-medium">
            <Truncate truncateLimit={60} text={environment?.name || ''} />
          </strong>
        </p>

        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-neutral-350">
              {selectedCount} of {totalCount} selected
            </span>
            {selectedCount > 0 ? (
              <Button onClick={handleDeselectAll} data-testid="deselect-all" size="sm" variant="surface" color="neutral">
                Deselect All
              </Button>
            ) : (
              <Button onClick={handleSelectAll} data-testid="select-all" size="sm" variant="surface" color="neutral">
                Select All
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoadingServices ? (
        <div className="flex items-center justify-center py-12">
          <LoaderSpinner className="mx-auto block" />
        </div>
      ) : totalCount === 0 ? (
        <div className="px-3 py-6 text-center" data-testid="empty-state">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="mt-1 text-xs font-medium text-neutral-350">No services found in this environment</p>
        </div>
      ) : (
        <ScrollShadowWrapper className="max-h-[440px]">
          {Object.entries(servicesByType).map(([type, services]) => {
            if (services.length === 0) return null

            return (
              <div key={type} className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-neutral-400 dark:text-neutral-50">{groupLabels[type]}</h3>
                <div>
                  {services.map((service, index) => {
                    const prevService = index > 0 ? services[index - 1] : undefined

                    return (
                      <ServiceVersionRow
                        key={service.id}
                        service={service}
                        organizationId={environment.organization.id}
                        isChecked={service.isSelected}
                        isSiblingChecked={prevService?.isSelected}
                        isFirst={index === 0}
                        isLast={index === services.length - 1}
                        onToggle={() => handleToggle(service.id)}
                        onVersionChange={(version) => handleVersionChange(service.id, version)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </ScrollShadowWrapper>
      )}

      <div className="sticky bottom-0 -mb-6 flex justify-end gap-3 bg-white py-6 dark:bg-neutral-550">
        <Button data-testid="cancel-button" color="neutral" variant="plain" size="lg" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          data-testid="submit-button"
          disabled={selectedCount === 0}
          type="submit"
          size="lg"
          onClick={handleSubmit}
          loading={isDeploying}
        >
          Deploy {selectedCount} service{selectedCount !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}

export default DeployWithVersionModal

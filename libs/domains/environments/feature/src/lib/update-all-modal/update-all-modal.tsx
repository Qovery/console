import { type QueryKey, type UseQueryOptions, useQueries, useQuery } from '@tanstack/react-query'
import { type DeployAllRequest, type Environment } from 'qovery-typescript-axios'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { sortVersions } from '@qovery/domains/organizations/feature'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { Button, Icon, InputCheckbox, LoaderSpinner, Popover, Truncate, useModal } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { useDeployAllServices } from '../hooks/use-deploy-all-services/use-deploy-all-services'
import { useOutdatedServices } from '../hooks/use-outdated-services/use-outdated-services'
import {
  type ServiceForDeploy,
  type ServiceVersionInfo,
  useServicesForDeploy,
} from '../hooks/use-services-for-deploy/use-services-for-deploy'
import {
  getCommitQueryServiceType,
  getLatestVersionFromQueryData,
  getServiceOutdatedState,
  isOutdatedManagedByHook,
  isSupportedUpdateAllService,
} from './update-all-modal.utils'

export interface UpdateAllModalProps {
  environment: Environment
}

interface ServiceSelection extends ServiceForDeploy {
  isOutdated: boolean
  isSelected: boolean
  selectedVersion?: ServiceVersionInfo
  latestOutdatedVersion?: ServiceVersionInfo
}

type ServiceSelectionState = Map<string, ServiceSelection>
type LatestVersionQueryOption = UseQueryOptions<unknown, unknown, unknown, QueryKey>

interface VersionOption {
  value: string
  topLabel: string
  bottomLabel?: string
  selectedLabel: string
  isLatest?: boolean
}

function buildDeployAllPayload(selections: ServiceSelection[]): DeployAllRequest {
  const payload: DeployAllRequest = {
    applications: [],
    containers: [],
    jobs: [],
    helms: [],
    databases: [],
  }

  for (const service of selections) {
    if (!service.isSelected) continue

    const selectedVersion = service.selectedVersion?.value
    match(service.serviceType)
      .with('APPLICATION', () => {
        if (!selectedVersion) return
        payload.applications!.push({
          application_id: service.id,
          git_commit_id: selectedVersion,
        })
      })
      .with('CONTAINER', () => {
        if (!selectedVersion) return
        payload.containers!.push({
          id: service.id,
          image_tag: selectedVersion,
        })
      })
      .with('JOB', () => {
        if (!selectedVersion) return
        const isGitSource = service.sourceType === 'git'
        payload.jobs!.push({
          id: service.id,
          git_commit_id: isGitSource ? selectedVersion : undefined,
          image_tag: !isGitSource ? selectedVersion : undefined,
        })
      })
      .with('HELM', () => {
        if (!selectedVersion) return
        const isGitSource = service.sourceType === 'git'
        payload.helms!.push({
          id: service.id,
          chart_version: !isGitSource ? selectedVersion : undefined,
          git_commit_id: isGitSource ? selectedVersion : undefined,
        })
      })
      .with('DATABASE', () => {
        payload.databases!.push(service.id)
      })
      .with('TERRAFORM', () => {
        if (!selectedVersion) return
      })
      .otherwise(() => {})
  }

  if (payload.applications?.length === 0) delete payload.applications
  if (payload.containers?.length === 0) delete payload.containers
  if (payload.jobs?.length === 0) delete payload.jobs
  if (payload.helms?.length === 0) delete payload.helms
  if (payload.databases?.length === 0) delete payload.databases

  return payload
}

function CurrentVersionBadge({ version, isOutdated }: { version?: ServiceVersionInfo; isOutdated: boolean }) {
  if (!version) {
    return <span className="text-xs text-neutral-350">-</span>
  }

  if (version.type === 'commit') {
    return (
      <span className="inline-flex h-7 items-center rounded border border-neutral-250 bg-white px-2 text-ssm font-normal text-neutral-400">
        <Icon iconName="code-commit" iconStyle="regular" className="mr-1" />
        {isOutdated ? version.displayValue : 'Latest'}
      </span>
    )
  }

  return (
    <span className="inline-flex h-7 items-center rounded border border-neutral-250 bg-white px-2 font-mono text-xs text-neutral-400">
      {version.displayValue}
    </span>
  )
}

function VersionSelector({
  service,
  organizationId,
  onVersionChange,
}: {
  service: ServiceSelection
  organizationId: string
  onVersionChange: (version: ServiceVersionInfo | undefined) => void
}) {
  const { sourceType, serviceType, containerSource, helmRepository, selectedVersion, currentVersion } = service

  const commitsServiceType = match({ serviceType, sourceType })
    .with({ sourceType: 'git', serviceType: 'APPLICATION' }, () => 'APPLICATION' as const)
    .with({ sourceType: 'git', serviceType: 'JOB' }, () => 'JOB' as const)
    .with({ sourceType: 'git', serviceType: 'HELM' }, () => 'HELM' as const)
    .with({ sourceType: 'git', serviceType: 'TERRAFORM' }, () => 'TERRAFORM' as const)
    .otherwise(() => undefined)

  const isCommitsEnabled = sourceType === 'git' && !!commitsServiceType
  const isContainerVersionsEnabled =
    sourceType === 'container' && !!containerSource?.registry?.id && !!containerSource?.image_name
  const isHelmVersionsEnabled =
    sourceType === 'helm-repository' && !!helmRepository?.repositoryId && !!helmRepository?.chartName

  const safeCommitsServiceType = commitsServiceType ?? 'APPLICATION'
  const { data: commits } = useQuery({
    ...queries.services.listCommits({
      serviceId: service.id,
      serviceType: safeCommitsServiceType,
    }),
    staleTime: 3 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isCommitsEnabled,
  })

  const { data: containerVersions } = useQuery({
    ...queries.organizations.containerVersions({
      organizationId,
      containerRegistryId: containerSource?.registry?.id ?? '',
      imageName: containerSource?.image_name ?? '',
    }),
    select: (data) =>
      data?.map(({ image_name, versions }) => ({
        image_name,
        versions: sortVersions(versions),
      })),
    refetchOnWindowFocus: false,
    enabled: isContainerVersionsEnabled,
  })

  const { data: helmVersions } = useQuery({
    ...queries.serviceHelm.helmCharts({
      organizationId,
      helmRepositoryId: helmRepository?.repositoryId ?? '',
      chartName: helmRepository?.chartName,
    }),
    select: (data) => data?.sort((a, b) => a.chart_name!.localeCompare(b.chart_name!)),
    enabled: isHelmVersionsEnabled,
  })

  const options = useMemo((): VersionOption[] => {
    return match(sourceType)
      .with('git', () =>
        (commits ?? []).map((commit, index) => ({
          value: commit.git_commit_id,
          topLabel: commit.git_commit_id.slice(0, 7),
          bottomLabel: commit.message || 'No message',
          selectedLabel: commit.git_commit_id.slice(0, 7),
          isLatest: index === 0,
        }))
      )
      .with('container', () => {
        const versions = containerVersions?.[0]?.versions ?? []
        return versions
          .filter((version) => version !== 'latest')
          .map((version, index) => ({
            value: version,
            topLabel: version,
            selectedLabel: version,
            isLatest: index === 0,
          }))
      })
      .with('helm-repository', () => {
        const chartVersions =
          sortVersions(helmVersions?.find(({ chart_name }) => chart_name === helmRepository?.chartName)?.versions ?? []) ??
          []
        return chartVersions.map((version, index) => ({
          value: version,
          topLabel: version,
          selectedLabel: version,
          isLatest: index === 0,
        }))
      })
      .with('database', () => [])
      .exhaustive()
  }, [sourceType, commits, containerVersions, helmVersions, helmRepository?.chartName])

  const selectedOption = options.find((option) => option.value === selectedVersion?.value)
  const selectedIsLatest = Boolean(selectedOption?.isLatest)

  const isGitSelector = sourceType === 'git'

  const triggerLabel = selectedOption
    ? selectedIsLatest
      ? 'Latest'
      : selectedOption.selectedLabel
    : currentVersion
      ? 'Latest'
      : 'Select target'

  const handleSelect = (option: VersionOption) => {
    const versionType = match(sourceType)
      .with('git', () => 'commit' as const)
      .with('container', () => 'tag' as const)
      .with('helm-repository', () => 'chart-version' as const)
      .with('database', () => 'tag' as const)
      .exhaustive()

    onVersionChange({
      type: versionType,
      value: option.value,
      displayValue: option.selectedLabel,
    })
  }

  if (sourceType === 'database') return null

  return (
    <Popover.Root>
      <Popover.Trigger>
        <button
          type="button"
          className="inline-flex h-7 items-center justify-between gap-2 rounded border border-neutral-250 bg-white px-2 text-ssm font-normal text-neutral-400"
          data-testid={`target-version-select-${service.id}`}
        >
          <span className="inline-flex min-w-0 items-center gap-1">
            {isGitSelector && <Icon iconName="code-commit" iconStyle="regular" />}
            <span className="truncate">{triggerLabel}</span>
          </span>
          <Icon iconName="chevron-down" className="text-neutral-350" />
        </button>
      </Popover.Trigger>
      <Popover.Content
        className="max-h-[320px] min-w-[320px] max-w-[320px] overflow-y-auto overflow-x-hidden rounded-md border border-neutral-250 bg-white p-0"
        sideOffset={6}
      >
        <ul>
          {options.map((option) => {
            const isSelected = option.value === selectedOption?.value

            return (
              <li key={option.value} className="border-b border-neutral-250 last:border-b-0">
                <Popover.Close>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`flex min-h-[62px] w-full min-w-0 flex-col items-start justify-center gap-0.5 p-3 text-left ${
                      isSelected ? 'bg-neutral-100' : 'bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 text-sm font-normal text-neutral-400">
                      {option.topLabel}
                      {isSelected && <Icon iconName="check" className="text-green-500" />}
                    </span>
                    {option.bottomLabel ? (
                      <span className="block w-full max-w-full truncate whitespace-nowrap text-ssm font-normal text-neutral-350">
                        {option.bottomLabel}
                      </span>
                    ) : null}
                  </button>
                </Popover.Close>
              </li>
            )
          })}
          {options.length === 0 && <li className="px-3 py-4 text-ssm text-neutral-350">No versions available</li>}
        </ul>
      </Popover.Content>
    </Popover.Root>
  )
}

function ServiceCard({
  service,
  organizationId,
  onToggle,
  onVersionChange,
}: {
  service: ServiceSelection
  organizationId: string
  onToggle: () => void
  onVersionChange: (version: ServiceVersionInfo | undefined) => void
}) {
  const isChecked = service.isSelected
  const avatarService = match(service.serviceType)
    .with('JOB', () => ({
      icon_uri: service.icon_uri,
      serviceType: 'JOB' as const,
      job_type: service.job_type ?? 'CRON',
    }))
    .with('CRON_JOB', () => ({
      icon_uri: service.icon_uri,
      serviceType: 'JOB' as const,
      job_type: 'CRON' as const,
    }))
    .with('LIFECYCLE_JOB', () => ({
      icon_uri: service.icon_uri,
      serviceType: 'JOB' as const,
      job_type: 'LIFECYCLE' as const,
    }))
    .otherwise((serviceType) => ({
      icon_uri: service.icon_uri,
      serviceType,
    }))

  return (
    <li
      data-testid="service-row"
      className={`flex h-14 items-center justify-between border-b border-neutral-250 px-4 last:border-b-0 ${
        isChecked ? 'bg-brand-50' : 'bg-white'
      }`}
    >
      <div
        className="flex min-w-0 cursor-pointer items-center gap-3"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle()
          }
        }}
      >
        <InputCheckbox name={service.id} value={service.id} isChecked={isChecked} />
        <ServiceAvatar
          size="xs"
          className="!h-5 !min-h-5 !w-5 !min-w-5 [&>*]:!h-5 [&>*]:!w-5"
          border="none"
          service={avatarService}
        />
        <span className="min-w-0 text-sm font-medium text-neutral-400">
          <Truncate text={service.name} truncateLimit={40} />
        </span>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <CurrentVersionBadge version={service.currentVersion} isOutdated={service.isOutdated} />
        <Icon iconName="arrow-right" className="text-neutral-350" />
        <VersionSelector service={service} organizationId={organizationId} onVersionChange={onVersionChange} />
      </div>
    </li>
  )
}

export function UpdateAllModal({ environment }: UpdateAllModalProps) {
  const { closeModal } = useModal()
  const { data: services = [], isLoading: isServicesLoading } = useServicesForDeploy({
    environmentId: environment.id,
  })
  const { data: outdatedServices = [], isLoading: isOutdatedServicesLoading } = useOutdatedServices({
    environmentId: environment.id,
  })

  const [selections, setSelections] = useState<ServiceSelectionState>(new Map())
  const [isInitialized, setIsInitialized] = useState(false)
  const { mutate: deployAllServices, isLoading: isDeployAllServicesLoading } = useDeployAllServices()

  const supportedServices = useMemo(() => services.filter(isSupportedUpdateAllService), [services])

  const latestVersionQueries = useQueries({
    queries: supportedServices.map((service): LatestVersionQueryOption => {
      if (isOutdatedManagedByHook(service)) {
        return {
          queryKey: ['update-all-modal', service.id, 'outdated-managed-by-hook'],
          queryFn: async () => null,
          enabled: false,
        }
      }

      if (service.sourceType === 'git') {
        const queryServiceType = getCommitQueryServiceType(service)
        return {
          ...queries.services.listCommits({
            serviceId: service.id,
            serviceType: queryServiceType ?? 'APPLICATION',
          }),
          staleTime: 3 * 60 * 1000,
          retry: false,
          refetchOnWindowFocus: false,
          enabled: Boolean(queryServiceType),
        } as unknown as LatestVersionQueryOption
      }

      if (service.sourceType === 'container') {
        return {
          ...queries.organizations.containerVersions({
            organizationId: environment.organization.id,
            containerRegistryId: service.containerSource?.registry?.id ?? '',
            imageName: service.containerSource?.image_name ?? '',
          }),
          refetchOnWindowFocus: false,
          enabled: Boolean(service.containerSource?.registry?.id && service.containerSource?.image_name),
        } as unknown as LatestVersionQueryOption
      }

      if (service.sourceType === 'helm-repository') {
        return {
          ...queries.serviceHelm.helmCharts({
            organizationId: environment.organization.id,
            helmRepositoryId: service.helmRepository?.repositoryId ?? '',
            chartName: service.helmRepository?.chartName,
          }),
          enabled: Boolean(service.helmRepository?.repositoryId && service.helmRepository?.chartName),
        } as unknown as LatestVersionQueryOption
      }

      return {
        queryKey: ['update-all-modal', service.id, 'unsupported-source'],
        queryFn: async () => null,
        enabled: false,
      }
    }),
  })

  const isLatestVersionsLoading = latestVersionQueries.some((query) => query.fetchStatus === 'fetching')

  const outdatedById = useMemo(
    () =>
      new Map(
        outdatedServices.map((service) => [
          service.id,
          service.commits[0]
            ? ({
                type: 'commit',
                value: service.commits[0].git_commit_id,
                displayValue: service.commits[0].git_commit_id.slice(0, 7),
              } as ServiceVersionInfo)
            : undefined,
        ])
      ),
    [outdatedServices]
  )

  const latestVersionById = useMemo(() => {
    const latestById = new Map<string, ServiceVersionInfo>()

    supportedServices.forEach((service, index) => {
      const latestVersion = getLatestVersionFromQueryData(service, latestVersionQueries[index]?.data)
      if (latestVersion) {
        latestById.set(service.id, latestVersion)
      }
    })

    return latestById
  }, [supportedServices, latestVersionQueries])

  useEffect(() => {
    if (isInitialized || isServicesLoading || isOutdatedServicesLoading || isLatestVersionsLoading) return

    const nextSelections: ServiceSelectionState = new Map(
      supportedServices.map((service) => {
        const {
          isOutdated,
          latestOutdatedVersion,
          defaultVersion,
        } = getServiceOutdatedState({
          service,
          outdatedByHookVersion: outdatedById.get(service.id),
          latestVersion: latestVersionById.get(service.id),
        })

        return [
          service.id,
          {
            ...service,
            isOutdated,
            isSelected: isOutdated,
            selectedVersion: defaultVersion,
            latestOutdatedVersion,
          } satisfies ServiceSelection,
        ]
      })
    )

    setSelections(nextSelections)
    setIsInitialized(true)
  }, [
    isInitialized,
    isServicesLoading,
    isOutdatedServicesLoading,
    isLatestVersionsLoading,
    supportedServices,
    outdatedById,
    latestVersionById,
  ])

  const orderedServices = useMemo(() => {
    const values = Array.from(selections.values())
    const outdated = values.filter((service) => service.isOutdated)
    const upToDate = values.filter((service) => !service.isOutdated)
    return { outdated, upToDate }
  }, [selections])

  const selectedCount = useMemo(
    () => Array.from(selections.values()).filter((service) => service.isSelected).length,
    [selections]
  )
  const outdatedCount = orderedServices.outdated.length
  const upToDateCount = orderedServices.upToDate.length
  const outdatedSelectedCount = orderedServices.outdated.filter((service) => service.isSelected).length

  const onSubmit = () => {
    if (selectedCount === 0) return

    const payload = buildDeployAllPayload(Array.from(selections.values()))
    deployAllServices({ environment, payload })
    closeModal()
  }

  const toggleService = useCallback((serviceId: string) => {
    setSelections((prev) => {
      const next = new Map(prev)
      const service = next.get(serviceId)
      if (!service) return prev

      if (!service.isSelected && !service.selectedVersion) {
        return prev
      }

      next.set(serviceId, {
        ...service,
        isSelected: !service.isSelected,
      })

      return next
    })
  }, [])

  const updateVersion = useCallback((serviceId: string, version: ServiceVersionInfo | undefined) => {
    setSelections((prev) => {
      const next = new Map(prev)
      const service = next.get(serviceId)
      if (!service) return prev

      next.set(serviceId, {
        ...service,
        selectedVersion: version,
        isSelected: Boolean(version),
      })

      return next
    })
  }, [])

  const selectAllOutdated = useCallback(() => {
    setSelections((prev) => {
      const next = new Map(prev)

      next.forEach((service, serviceId) => {
        if (!service.isOutdated) return

        next.set(serviceId, {
          ...service,
          isSelected: Boolean(service.latestOutdatedVersion),
          selectedVersion: service.latestOutdatedVersion,
        })
      })

      return next
    })
  }, [])

  const unselectAllOutdated = useCallback(() => {
    setSelections((prev) => {
      const next = new Map(prev)

      next.forEach((service, serviceId) => {
        if (!service.isOutdated) return

        next.set(serviceId, {
          ...service,
          isSelected: false,
        })
      })

      return next
    })
  }, [])

  const renderSection = ({
    title,
    servicesInSection,
    showBulkActions,
  }: {
    title: ReactNode
    servicesInSection: ServiceSelection[]
    showBulkActions?: boolean
  }) => {
    if (servicesInSection.length === 0) return null

    return (
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-350">{title}</p>
          {showBulkActions && outdatedCount > 0 && (
            <>
              {outdatedSelectedCount > 0 ? (
                <Button
                  onClick={unselectAllOutdated}
                  data-testid="deselect-all"
                  size="sm"
                  variant="surface"
                  color="neutral"
                >
                  Unselect all
                </Button>
              ) : (
                <Button
                  onClick={selectAllOutdated}
                  data-testid="select-all"
                  size="sm"
                  variant="surface"
                  color="neutral"
                >
                  Select all
                </Button>
              )}
            </>
          )}
        </div>
        <ul className="overflow-hidden rounded-md border border-neutral-250">
          {servicesInSection.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              organizationId={environment.organization.id}
              onToggle={() => toggleService(service.id)}
              onVersionChange={(version) => updateVersion(service.id, version)}
            />
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="max-h-[80vh] overflow-y-auto p-5 pb-[88px]">
        <h2 className="h4 mb-1 max-w-sm truncate text-neutral-400 dark:text-neutral-50">Deploy by version</h2>
        <p className="mb-4 text-sm font-normal text-neutral-350 dark:text-neutral-50">
          Select the service and choose a specific version to deploy on each of those
        </p>

        {isOutdatedServicesLoading || isServicesLoading || isLatestVersionsLoading ? (
          <div className="py-6">
            <LoaderSpinner className="mx-auto block" />
          </div>
        ) : (
          <div className="space-y-4">
            {renderSection({
              title: `${outdatedCount} outdated services`,
              servicesInSection: orderedServices.outdated,
              showBulkActions: true,
            })}
            {renderSection({
              title: `${upToDateCount} up to date services`,
              servicesInSection: orderedServices.upToDate,
            })}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex justify-end gap-3 bg-white px-5 py-4 dark:bg-neutral-550">
        <Button data-testid="cancel-button" color="neutral" variant="plain" size="lg" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          data-testid="submit-button"
          disabled={selectedCount === 0}
          type="submit"
          size="lg"
          onClick={onSubmit}
          loading={isDeployAllServicesLoading}
        >
          {selectedCount === 0
            ? 'No services to update'
            : `Update ${selectedCount} service${selectedCount > 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
}

export default UpdateAllModal

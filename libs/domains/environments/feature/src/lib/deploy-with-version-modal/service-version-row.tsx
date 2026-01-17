import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useQuery } from '@tanstack/react-query'
import { type Commit } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { sortVersions } from '@qovery/domains/organizations/feature'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { Button, Icon, InputCheckbox, InputSelect, LoaderSpinner, TagCommit, Truncate } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import {
  type ServiceForDeploy,
  type ServiceVersionInfo,
  type VersionSourceType,
  type VersionType,
} from '../hooks/use-services-for-deploy/use-services-for-deploy'

export interface ServiceVersionSelection extends ServiceForDeploy {
  isSelected: boolean
  selectedVersion?: ServiceVersionInfo
}

export interface ServiceVersionRowProps {
  service: ServiceVersionSelection
  organizationId: string
  isChecked: boolean
  isSiblingChecked?: boolean
  isFirst?: boolean
  isLast?: boolean
  onToggle: () => void
  onVersionChange: (version: ServiceVersionInfo | undefined) => void
}

function getServiceTypeIcon(serviceType: ServiceType): IconName {
  return match(serviceType)
    .with('APPLICATION', () => 'code' as IconName)
    .with('CONTAINER', () => 'box' as IconName)
    .with('DATABASE', () => 'database' as IconName)
    .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => 'clock' as IconName)
    .with('HELM', () => 'dharmachakra' as IconName)
    .with('TERRAFORM', () => 'layer-group' as IconName)
    .exhaustive()
}

function getServiceTypeLabel(serviceType: ServiceType, sourceType: VersionSourceType): string {
  return match({ serviceType, sourceType })
    .with({ serviceType: 'APPLICATION' }, () => 'Application')
    .with({ serviceType: 'CONTAINER' }, () => 'Container')
    .with({ serviceType: 'DATABASE' }, () => 'Database')
    .with({ serviceType: 'JOB', sourceType: 'git' }, () => 'Job (Git)')
    .with({ serviceType: 'JOB', sourceType: 'container' }, () => 'Job (Image)')
    .with({ serviceType: 'HELM', sourceType: 'git' }, () => 'Helm (Git)')
    .with({ serviceType: 'HELM', sourceType: 'helm-repository' }, () => 'Helm (Chart)')
    .with({ serviceType: 'TERRAFORM' }, () => 'Terraform')
    .otherwise(() => serviceType)
}

function CurrentBadge() {
  return (
    <span className="shrink-0 rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-neutral-400 dark:bg-neutral-500 dark:text-neutral-50">
      Current
    </span>
  )
}

function VersionSelector({
  service,
  organizationId,
  selectedVersion,
  onVersionChange,
}: {
  service: ServiceVersionSelection
  organizationId: string
  selectedVersion?: ServiceVersionInfo
  onVersionChange: (version: ServiceVersionInfo | undefined) => void
}) {
  const { sourceType, serviceType, containerSource, helmRepository, currentVersion } = service

  // Map serviceType to the correct type for commits query
  const commitsServiceType = match({ serviceType, sourceType })
    .with({ sourceType: 'git', serviceType: 'APPLICATION' }, () => 'APPLICATION' as const)
    .with({ sourceType: 'git', serviceType: 'JOB' }, () => 'JOB' as const)
    .with({ sourceType: 'git', serviceType: 'HELM' }, () => 'HELM' as const)
    .with({ sourceType: 'git', serviceType: 'TERRAFORM' }, () => 'TERRAFORM' as const)
    .otherwise(() => undefined)

  // Determine if each query should be enabled
  const isCommitsEnabled = sourceType === 'git' && !!commitsServiceType
  const isContainerVersionsEnabled =
    sourceType === 'container' && !!containerSource?.registry?.id && !!containerSource?.image_name
  const isHelmVersionsEnabled =
    sourceType === 'helm-repository' && !!helmRepository?.repositoryId && !!helmRepository?.chartName

  // Fetch commits for git-based services
  // Use a default service type to satisfy TypeScript when the query is disabled
  const safeCommitsServiceType = commitsServiceType ?? 'APPLICATION'
  const {
    data: commits,
    isFetching: isFetchingCommits,
    isError: isCommitsError,
  } = useQuery({
    ...queries.services.listCommits({
      serviceId: service.id,
      serviceType: safeCommitsServiceType,
    }),
    staleTime: 3 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isCommitsEnabled,
  })

  // Fetch container versions for container-based services
  const {
    data: containerVersions,
    isFetching: isFetchingContainerVersions,
    isError: isContainerVersionsError,
  } = useQuery({
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

  // Fetch helm chart versions for helm repository services
  const {
    data: helmVersions,
    isFetching: isFetchingHelmVersions,
    isError: isHelmVersionsError,
  } = useQuery({
    ...queries.serviceHelm.helmCharts({
      organizationId,
      helmRepositoryId: helmRepository?.repositoryId ?? '',
      chartName: helmRepository?.chartName,
    }),
    select: (data) => data?.sort((a, b) => a.chart_name!.localeCompare(b.chart_name!)),
    enabled: isHelmVersionsEnabled,
  })

  // Only check loading/error state for the relevant query based on source type
  const isLoading = match(sourceType)
    .with('git', () => isFetchingCommits)
    .with('container', () => isFetchingContainerVersions)
    .with('helm-repository', () => isFetchingHelmVersions)
    .with('database', () => false)
    .exhaustive()

  const isError = match(sourceType)
    .with('git', () => isCommitsError)
    .with('container', () => isContainerVersionsError)
    .with('helm-repository', () => isHelmVersionsError)
    .with('database', () => false)
    .exhaustive()

  const options = useMemo(() => {
    return match(sourceType)
      .with('git', () =>
        (commits ?? []).map((commit: Commit) => {
          const isCurrent = commit.git_commit_id === currentVersion?.value
          return {
            value: commit.git_commit_id,
            label: (
              <div className="flex items-center gap-2">
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                  <TagCommit commitId={commit.git_commit_id} />
                </div>
                <span className="truncate">{commit.message || 'No message'}</span>
                {isCurrent && (
                  <CurrentBadge />
                )}
              </div>
            ),
            selectedLabel: commit.message || 'No message',
          }
        })
      )
      .with('container', () => {
        const versions = containerVersions?.[0]?.versions ?? []
        return versions.map((version) => {
          const isCurrent = version === currentVersion?.value
          return {
            value: version,
            label: (
              <div className="flex items-center gap-2">
                <span>{version}</span>
                {isCurrent && (
                  <CurrentBadge />
                )}
              </div>
            ),
            selectedLabel: version,
            isDisabled: version === 'latest',
          }
        })
      })
      .with('helm-repository', () => {
        const chartVersions =
          helmVersions?.find(({ chart_name }) => chart_name === helmRepository?.chartName)?.versions ?? []
        return chartVersions.map((version) => {
          const isCurrent = version === currentVersion?.value
          return {
            value: version,
            label: (
              <div className="flex items-center gap-2">
                <span>{version}</span>
                {isCurrent && (
                  <CurrentBadge />
                )}
              </div>
            ),
            selectedLabel: version,
          }
        })
      })
      .with('database', () => [])
      .exhaustive()
  }, [sourceType, commits, containerVersions, helmVersions, helmRepository?.chartName, currentVersion?.value])

  const getVersionType = (sourceType: VersionSourceType): VersionType => {
    return match(sourceType)
      .with('git', () => 'commit' as const)
      .with('container', () => 'tag' as const)
      .with('helm-repository', () => 'chart-version' as const)
      .with('database', () => 'tag' as const)
      .exhaustive()
  }

  const handleChange = (value: string | null) => {
    if (!value) {
      onVersionChange(undefined)
      return
    }
    const versionType = getVersionType(sourceType)
    onVersionChange({
      type: versionType,
      value,
      displayValue: versionType === 'commit' ? value.slice(0, 7) : value,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <LoaderSpinner className="h-5 w-5" />
        <span className="ml-2 text-sm text-neutral-350">Loading versions...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-3 text-sm text-red-500">
        <Icon iconName="circle-exclamation" className="mr-2" />
        Failed to load versions
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="py-3 text-sm text-neutral-350">
        <Icon iconName="info-circle" className="mr-2" />
        No versions available
      </div>
    )
  }

  return (
    <InputSelect
      label="Version to deploy"
      options={options}
      value={selectedVersion?.value}
      onChange={(value) => handleChange(value as string | null)}
      isSearchable
      isClearable
      portal
      filterOption="startsWith"
    />
  )
}

export function ServiceVersionRow({
  service,
  organizationId,
  isChecked,
  isSiblingChecked,
  isFirst,
  isLast,
  onToggle,
  onVersionChange,
}: ServiceVersionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { sourceType, serviceType, name, currentVersion, selectedVersion } = service

  const canSelectVersion = sourceType !== 'database'

  const borderClasses = twMerge(
    'border border-b-0 dark:border-neutral-400',
    isFirst && 'rounded-t',
    isLast && 'rounded-b !border-b',
    isChecked ? 'border-brand-500 bg-brand-50 dark:bg-neutral-500' : 'border-neutral-250',
    isSiblingChecked && 'border-t-brand-500'
  )

  return (
    <div className={borderClasses}>
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        <div className="flex items-center gap-3">
          <InputCheckbox name={service.id} value={service.id} isChecked={isChecked} className="shrink-0" />
          <Icon iconName={getServiceTypeIcon(serviceType)} className="text-neutral-350" />
          <div className="flex flex-col">
            <span className="font-medium text-neutral-400 dark:text-neutral-50">
              <Truncate truncateLimit={40} text={name} />
            </span>
            <span className="text-xs text-neutral-350">{getServiceTypeLabel(serviceType, sourceType)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {currentVersion && (
            <div className="flex items-center gap-2 text-sm text-neutral-350">
              <span>Current:</span>
              {currentVersion.type === 'commit' ? (
                <TagCommit commitId={currentVersion.value} />
              ) : (
                <span className="rounded bg-neutral-150 px-2 py-0.5 font-mono text-xs dark:bg-neutral-500">
                  {currentVersion.displayValue}
                </span>
              )}
            </div>
          )}

          {selectedVersion && (
            <>
              <Icon iconName="arrow-right" className="text-neutral-300" />
              <div className="flex items-center gap-2 text-sm text-brand-500">
                {selectedVersion.type === 'commit' ? (
                  <TagCommit commitId={selectedVersion.value} />
                ) : (
                  <span className="rounded bg-brand-100 px-2 py-0.5 font-mono text-xs dark:bg-brand-500 dark:text-white">
                    {selectedVersion.displayValue}
                  </span>
                )}
              </div>
            </>
          )}

          {canSelectVersion && (
            <Button
              type="button"
              size="sm"
              variant="surface"
              color="neutral"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2"
            >
              <Icon iconName={isExpanded ? 'chevron-up' : 'chevron-down'} className="mr-1" />
              {selectedVersion ? 'Change' : 'Select version'}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && canSelectVersion && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-400 dark:bg-neutral-600">
          <VersionSelector
            service={service}
            organizationId={organizationId}
            selectedVersion={selectedVersion}
            onVersionChange={onVersionChange}
          />
        </div>
      )}
    </div>
  )
}

export default ServiceVersionRow

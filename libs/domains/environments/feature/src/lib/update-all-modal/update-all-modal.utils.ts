import { sortVersions } from '@qovery/domains/organizations/feature'
import { match } from 'ts-pattern'
import { type ServiceForDeploy, type ServiceVersionInfo } from '../hooks/use-services-for-deploy/use-services-for-deploy'

type CommitQueryServiceType = 'APPLICATION' | 'JOB' | 'HELM' | 'TERRAFORM'

export function isSupportedUpdateAllService(service: ServiceForDeploy) {
  return service.sourceType !== 'database'
}

export function isOutdatedManagedByHook(service: ServiceForDeploy) {
  return service.sourceType === 'git' && (service.serviceType === 'APPLICATION' || service.serviceType === 'JOB')
}

export function getCommitQueryServiceType(service: ServiceForDeploy): CommitQueryServiceType | undefined {
  if (service.sourceType !== 'git') return undefined

  return match(service.serviceType)
    .with('APPLICATION', () => 'APPLICATION' as const)
    .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => 'JOB' as const)
    .with('HELM', () => 'HELM' as const)
    .with('TERRAFORM', () => 'TERRAFORM' as const)
    .otherwise(() => undefined)
}

export function getLatestVersionFromQueryData(service: ServiceForDeploy, data: unknown): ServiceVersionInfo | undefined {
  if (!data) return undefined

  return match(service.sourceType)
    .with('git', () => {
      const commits = data as { git_commit_id: string }[]
      const latestCommitId = commits?.[0]?.git_commit_id
      if (!latestCommitId) return undefined
      return {
        type: 'commit' as const,
        value: latestCommitId,
        displayValue: latestCommitId.slice(0, 7),
      }
    })
    .with('container', () => {
      const images = data as { versions?: string[] }[]
      const versions = (sortVersions(images?.[0]?.versions ?? []) ?? []).filter((version) => version !== 'latest')
      const latestTag = versions[0]
      if (!latestTag) return undefined
      return {
        type: 'tag' as const,
        value: latestTag,
        displayValue: latestTag,
      }
    })
    .with('helm-repository', () => {
      const charts = data as { chart_name?: string; versions?: string[] }[]
      const versions =
        charts
          ?.find(({ chart_name }) => chart_name === service.helmRepository?.chartName)
          ?.versions?.slice() ?? []

      const sortedVersions = sortVersions(versions) ?? []
      const latestChartVersion = sortedVersions[0]
      if (!latestChartVersion) return undefined
      return {
        type: 'chart-version' as const,
        value: latestChartVersion,
        displayValue: latestChartVersion,
      }
    })
    .with('database', () => undefined)
    .exhaustive()
}

export function getServiceOutdatedState({
  service,
  outdatedByHookVersion,
  latestVersion,
}: {
  service: ServiceForDeploy
  outdatedByHookVersion?: ServiceVersionInfo
  latestVersion?: ServiceVersionInfo
}) {
  const outdatedByHook = Boolean(outdatedByHookVersion)
  const outdatedByLatest =
    Boolean(latestVersion?.value) &&
    Boolean(service.currentVersion?.value) &&
    latestVersion?.value !== service.currentVersion?.value

  const isOutdated = outdatedByHook || outdatedByLatest
  const latestOutdatedVersion = outdatedByHookVersion ?? (isOutdated ? latestVersion : undefined)
  const defaultVersion = latestOutdatedVersion ?? latestVersion ?? service.currentVersion

  return {
    isOutdated,
    latestOutdatedVersion,
    defaultVersion,
  }
}

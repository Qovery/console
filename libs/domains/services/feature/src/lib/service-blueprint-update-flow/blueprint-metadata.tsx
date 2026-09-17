import { Link, useParams } from '@tanstack/react-router'
import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Badge, ExternalLink, Icon, Skeleton, Truncate } from '@qovery/shared/ui'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import { useBlueprintUpdateState } from '../hooks/use-blueprint-update-state/use-blueprint-update-state'
import { ServiceAvatar } from '../service-avatar/service-avatar'
import { BlueprintUpdateBadge } from './blueprint-update-badge'
import { getBlueprintServiceVersion } from './blueprint-update-utils'

function BlueprintUpdateBadgeSkeleton() {
  return <Skeleton width={122} height={24} />
}

function BlueprintRepository({ gitRepository }: { gitRepository: ApplicationGitRepository }) {
  if (!gitRepository.url || !gitRepository.name) {
    return null
  }

  return (
    <ExternalLink
      href={buildGitProviderUrl(gitRepository.url)}
      target="_blank"
      rel="noopener noreferrer"
      variant="outline"
      color="neutral"
      size="xs"
      as="button"
      className="text-nowrap"
    >
      {gitRepository.provider && <Icon width={12} name={gitRepository.provider} />}
      <Truncate text={gitRepository.name} truncateLimit={17} />
    </ExternalLink>
  )
}

export function BlueprintMetadataSkeleton({
  gitRepository,
  showVersion = true,
  showRepository = true,
  showUpdateBadge = true,
}: {
  gitRepository?: ApplicationGitRepository
  showVersion?: boolean
  showRepository?: boolean
  showUpdateBadge?: boolean
}) {
  return (
    <>
      {showVersion && <Skeleton width={50} height={24} />}
      {showRepository && gitRepository && <BlueprintRepository gitRepository={gitRepository} />}
      {showUpdateBadge && <BlueprintUpdateBadgeSkeleton />}
    </>
  )
}

export function BlueprintMetadata({
  blueprintId,
  gitRepository,
  service,
  linkVersionToSettings = false,
  showVersion = true,
  showRepository = true,
  showUpdateBadge = true,
}: {
  blueprintId: string
  gitRepository?: ApplicationGitRepository
  service: AnyService
  linkVersionToSettings?: boolean
  showVersion?: boolean
  showRepository?: boolean
  showUpdateBadge?: boolean
}) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  // `throwOnError: false` because react-query v4 makes suspense queries throw by default, and there
  // is no boundary between here and the organization layout: a blueprint pinned to a tag the
  // catalog cannot resolve would replace the whole overview with the generic error page.
  const { blueprintUpdate, tag } = useBlueprintUpdateState({
    blueprintId,
    localTag: gitRepository?.branch,
    suspense: true,
    throwOnError: false,
  })
  const currentVersion = tag ? getBlueprintServiceVersion(tag) : undefined
  const versionBadge = currentVersion && currentVersion !== 'default' && (
    <Badge variant="outline" className="gap-1 whitespace-nowrap">
      <ServiceAvatar service={service} size="custom" radius="none" serviceAvatarRadius="sm" className="h-3 w-3" />
      <span>v{currentVersion}</span>
    </Badge>
  )

  return (
    <>
      {showVersion &&
        (linkVersionToSettings ? (
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/blueprint-configuration"
            params={{ organizationId, projectId, environmentId, serviceId }}
            className="inline-flex"
          >
            {versionBadge}
          </Link>
        ) : (
          versionBadge
        ))}
      {showRepository && gitRepository && <BlueprintRepository gitRepository={gitRepository} />}
      {showUpdateBadge && blueprintUpdate && (
        <BlueprintUpdateBadge
          blueprintUpdate={blueprintUpdate}
          service={service}
          organizationId={organizationId}
          projectId={projectId}
        />
      )}
    </>
  )
}

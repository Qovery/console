import { useParams } from '@tanstack/react-router'
import {
  type ApplicationGitRepository,
  type ContainerResponse,
  type HelmSourceRepositoryResponse,
} from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import {
  type AnyService,
  type Application,
  type BlueprintService,
  type Database,
  type Helm,
  type Job,
  type Terraform,
  isBlueprintService,
} from '@qovery/domains/services/data-access'
import {
  IconEnum,
  isHelmGitSource,
  isHelmRepositorySource,
  isJobContainerSource,
  isJobGitSource,
} from '@qovery/shared/enums'
import { Badge, ExternalLink, Icon, Skeleton, Tooltip, Truncate } from '@qovery/shared/ui'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'
import { useBlueprintUpdate } from '../../hooks/use-blueprint-update/use-blueprint-update'
import LastCommit from '../../last-commit/last-commit'
import LastVersion from '../../last-version/last-version'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import { BlueprintRcBadge } from '../../service-blueprint-update-flow/blueprint-rc-badge'
import { BlueprintUpdateBadge } from '../../service-blueprint-update-flow/blueprint-update-badge'
import {
  getBlueprintServiceVersion,
  isBlueprintRcTag,
} from '../../service-blueprint-update-flow/blueprint-update-utils'

type ServiceVersionCellProps = {
  service: AnyService
}

// The update check is the only endpoint that reports a blueprint's tag, and it answers 404 for any
// tag the catalog does not publish — a prerelease, but a retired major too. `localTag` is the tag
// read off the service itself, so a prerelease stays recognisable when the check cannot answer.
function useBlueprintUpdateState(blueprintId: string, localTag?: string) {
  const { data: blueprintUpdate, isLoading } = useBlueprintUpdate({ blueprintId })

  return {
    blueprintUpdate,
    isLoading,
    isRc: isBlueprintRcTag(blueprintUpdate?.current_tag ?? localTag),
  }
}

function BlueprintVersionInfo({
  service,
  gitRepository,
}: {
  service: BlueprintService
  gitRepository: ApplicationGitRepository
}) {
  const { organizationId = '', projectId = '' } = useParams({ strict: false }) ?? {}
  // The engine pins the generated service to the blueprint tag as its git branch.
  const { blueprintUpdate, isLoading, isRc } = useBlueprintUpdateState(service.blueprint_id, gitRepository.branch)
  const version = blueprintUpdate?.current_tag ? getBlueprintServiceVersion(blueprintUpdate.current_tag) : undefined

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2 text-neutral">
          <Icon className="h-3 w-3 shrink-0 text-inherit" name={gitRepository.provider} />
          <ExternalLink
            href={gitRepository.url}
            underline
            color="neutral"
            size="ssm"
            withIcon={false}
            className="min-w-0 max-w-full font-normal"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="min-w-0 truncate" title={gitRepository.name}>
              {gitRepository.name}
            </span>
          </ExternalLink>
        </div>
        {!isRc && version && version !== 'default' && (
          <div className="flex min-w-0 items-center gap-2 text-neutral">
            <ServiceAvatar
              service={service}
              size="custom"
              radius="none"
              serviceAvatarRadius="sm"
              className="h-3.5 w-3.5 shrink-0"
            />
            <span className="min-w-0 truncate text-ssm" title={`v${version}`}>
              v{version}
            </span>
          </div>
        )}
      </div>
      {isLoading ? (
        <Skeleton width={119} height={24} />
      ) : isRc ? (
        <BlueprintRcBadge />
      ) : blueprintUpdate ? (
        <div onClick={(event) => event.stopPropagation()}>
          <BlueprintUpdateBadge
            blueprintUpdate={blueprintUpdate}
            service={service}
            organizationId={organizationId}
            projectId={projectId}
          />
        </div>
      ) : null}
    </div>
  )
}

// A HELM blueprint's linked service has no git source, so it renders through `helmInfo` and never
// reaches `BlueprintVersionInfo` — and has nowhere to carry its tag either, leaving the update
// check as the only source. When it cannot answer, the chart version stays visible but loses its
// "deploy another version" action: the service may well be on a prerelease pin whose tag is gone
// once its pull request closes, and there is no way from here to tell that apart.
function BlueprintHelmVersionSlot({
  service,
  version,
  organizationId,
  projectId,
}: {
  service: BlueprintService & Helm
  version: string
  organizationId: string
  projectId: string
}) {
  const { blueprintUpdate, isLoading, isRc } = useBlueprintUpdateState(service.blueprint_id)

  if (isLoading) return <Skeleton width={119} height={24} />
  if (isRc) return <BlueprintRcBadge />

  if (!blueprintUpdate) {
    return (
      <Badge variant="surface" className="gap-1 whitespace-nowrap">
        <Icon iconName="tag" className="w-3" />
        <Truncate text={version} truncateLimit={8} />
      </Badge>
    )
  }

  return <LastVersion organizationId={organizationId} projectId={projectId} service={service} version={version} />
}

export function ServiceVersionCell({ service }: ServiceVersionCellProps) {
  const { organizationId = '', projectId = '' } = useParams({ strict: false }) ?? {}

  const gitInfo = (service: Application | Job | Helm | Terraform, gitRepository?: ApplicationGitRepository) => {
    if (!gitRepository) return null

    if (isBlueprintService(service)) {
      return <BlueprintVersionInfo service={service} gitRepository={gitRepository} />
    }

    return (
      <div className="flex w-full min-w-0 items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-2 text-neutral">
              <Icon className="h-3 w-3 shrink-0 text-inherit" name={gitRepository.provider} />
              <ExternalLink
                href={gitRepository.url}
                underline
                color="neutral"
                size="ssm"
                withIcon={false}
                className="min-w-0 flex-1 font-normal"
              >
                <span className="min-w-0 truncate" title={gitRepository.name}>
                  {gitRepository.name}
                </span>
              </ExternalLink>
            </div>
            {gitRepository.branch && gitRepository.url && (
              <div className="flex min-w-0 items-center gap-2 text-neutral-subtle">
                <Icon className="h-3 w-3 shrink-0 text-inherit" iconName="code-branch" iconStyle="regular" />
                <ExternalLink
                  href={buildGitProviderUrl(gitRepository.url, gitRepository.branch)}
                  underline
                  color="neutral"
                  size="ssm"
                  withIcon={false}
                  className="min-w-0 flex-1 overflow-hidden font-normal"
                >
                  <span className="min-w-0 truncate" title={gitRepository.branch}>
                    {gitRepository.branch}
                  </span>
                </ExternalLink>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {'auto_deploy' in service && service.auto_deploy && (
            <Tooltip content="Auto-deploy">
              <span>
                <Icon className="text-xs text-neutral-subtle" iconName="arrows-rotate" />
              </span>
            </Tooltip>
          )}
          <LastCommit
            organizationId={organizationId}
            projectId={projectId}
            gitRepository={gitRepository}
            service={service}
          />
        </div>
      </div>
    )
  }
  const containerInfo = (containerImage?: Pick<ContainerResponse, 'image_name' | 'tag' | 'registry'>) =>
    containerImage && (
      <div className="flex w-full min-w-0 items-center gap-1 text-ssm" onClick={(e) => e.stopPropagation()}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2 text-neutral">
            <Icon className="shrink-0" width={16} name={containerRegistryKindToIcon(containerImage.registry.kind)} />
            <Tooltip
              classNameTrigger="min-w-0 flex-1 overflow-hidden"
              content={
                <span className="text-center">
                  {containerImage.registry.name}
                  <br />
                  {containerImage.registry.url}
                </span>
              }
            >
              <span className="truncate text-neutral" title={containerImage.registry.name}>
                {containerImage.registry.name.toLowerCase()}
              </span>
            </Tooltip>
          </span>
          <span className="flex min-w-0 items-center gap-2 text-neutral">
            <Icon className="shrink-0" width={16} name={IconEnum.CONTAINER} />
            <span className="min-w-0 flex-1 truncate" title={containerImage.image_name}>
              {containerImage.image_name}
            </span>
          </span>
        </div>
        {(service.serviceType === 'CONTAINER' ||
          (service.serviceType === 'JOB' && isJobContainerSource(service.source))) && (
          <div className="shrink-0">
            <LastVersion
              organizationId={organizationId}
              projectId={projectId}
              service={service}
              version={containerImage.tag}
            />
          </div>
        )}
      </div>
    )

  const datasourceInfo = (datasource?: Pick<Database, 'accessibility' | 'mode' | 'type' | 'version'>) =>
    datasource && (
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-ssm">
        <div className="flex min-w-0 items-center gap-2 text-neutral">
          <Icon name={datasource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />
          <span className="min-w-0 flex-1 truncate">
            {datasource.type.toLowerCase().replace('sql', 'SQL').replace('db', 'DB')}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-neutral">
          <Icon name={datasource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />
          <span className="min-w-0 flex-1 truncate">v{datasource.version}</span>
        </div>
      </div>
    )

  const helmInfo = (helmRepository?: HelmSourceRepositoryResponse) =>
    helmRepository && (
      <div className="flex w-full min-w-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-ssm">
          <span className="flex min-w-0 items-center gap-2 text-neutral">
            <Icon className="shrink-0" width={12} name={IconEnum.HELM_OFFICIAL} />
            <Tooltip
              classNameTrigger="min-w-0 flex-1 overflow-hidden"
              content={
                <span className="text-center">
                  {helmRepository.repository?.name}
                  <br />
                  {helmRepository.repository?.url}
                </span>
              }
            >
              <span className="truncate text-neutral" title={helmRepository.repository?.name}>
                {helmRepository.repository?.name?.toLowerCase()}
              </span>
            </Tooltip>
          </span>
          <span className="flex min-w-0 items-center gap-2 text-neutral">
            <Icon className="shrink-0" width={12} name={IconEnum.HELM_OFFICIAL} />
            <span className="min-w-0 flex-1 truncate" title={helmRepository.chart_name}>
              {helmRepository.chart_name}
            </span>
          </span>
        </div>
        {service.serviceType === 'HELM' && (
          <div className="shrink-0">
            {isBlueprintService(service) ? (
              <BlueprintHelmVersionSlot
                service={service}
                version={helmRepository.chart_version}
                organizationId={organizationId}
                projectId={projectId}
              />
            ) : (
              <LastVersion
                organizationId={organizationId}
                projectId={projectId}
                service={service}
                version={helmRepository.chart_version}
              />
            )}
          </div>
        )}
      </div>
    )

  const cell = match({ service })
    .with({ service: P.intersection({ serviceType: 'JOB' }, { source: P.when(isJobGitSource) }) }, ({ service }) => {
      const {
        source: { docker },
      } = service
      return gitInfo(service, docker?.git_repository)
    })
    .with(
      { service: P.intersection({ serviceType: 'JOB' }, { source: P.when(isJobContainerSource) }) },
      ({
        service: {
          source: { image },
        },
      }) => containerInfo(image)
    )
    .with({ service: { serviceType: 'APPLICATION' } }, ({ service }) => gitInfo(service, service.git_repository))
    .with({ service: { serviceType: 'CONTAINER' } }, ({ service: { image_name, tag, registry } }) =>
      containerInfo({ image_name, tag, registry })
    )
    .with({ service: { serviceType: 'DATABASE' } }, ({ service: { accessibility, mode, type, version } }) =>
      datasourceInfo({ accessibility, mode, type, version })
    )
    .with({ service: P.intersection({ serviceType: 'HELM' }, { source: P.when(isHelmGitSource) }) }, ({ service }) => {
      const {
        source: { git },
      } = service
      return gitInfo(service, git?.git_repository)
    })
    .with(
      { service: P.intersection({ serviceType: 'HELM' }, { source: P.when(isHelmRepositorySource) }) },
      ({
        service: {
          source: { repository },
        },
      }) => helmInfo(repository)
    )
    .with({ service: { serviceType: 'TERRAFORM' } }, ({ service }) => {
      return gitInfo(service, service?.terraform_files_source?.git?.git_repository)
    })
    .with({ service: { serviceType: P.union('ARGOCD_APP', 'AGENTIC_WORKFLOW') } }, () => null)
    .exhaustive()
  return cell
}

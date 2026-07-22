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
  type Database,
  type Helm,
  type Job,
  type Terraform,
} from '@qovery/domains/services/data-access'
import {
  IconEnum,
  isHelmGitSource,
  isHelmRepositorySource,
  isJobContainerSource,
  isJobGitSource,
} from '@qovery/shared/enums'
import { ExternalLink, Icon, Skeleton, Tooltip } from '@qovery/shared/ui'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'
import { useBlueprintUpdate } from '../../hooks/use-blueprint-update/use-blueprint-update'
import LastCommit from '../../last-commit/last-commit'
import LastVersion from '../../last-version/last-version'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import { BlueprintUpdateBadge } from '../../service-update-flow/blueprint/blueprint-update-badge'
import { getBlueprintUpdateVersion } from '../../service-update-flow/blueprint/blueprint-update-utils'

type ServiceVersionCellProps = {
  service: AnyService
}

type BlueprintService = AnyService & {
  blueprint_id: string
  tag?: string
}

function isBlueprintService(service: AnyService): service is BlueprintService {
  return 'blueprint_id' in service && Boolean(service.blueprint_id)
}

function BlueprintVersionInfo({
  service,
  gitRepository,
}: {
  service: BlueprintService
  gitRepository: ApplicationGitRepository
}) {
  const { environmentId = '', organizationId = '', projectId = '' } = useParams({ strict: false }) ?? {}
  const { data: blueprintUpdate, isLoading } = useBlueprintUpdate({ blueprintId: service.blueprint_id })
  const version = service.tag ? getBlueprintUpdateVersion(service.tag) : undefined

  return (
    <div
      className="flex w-full min-w-0 items-center justify-between gap-6"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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
        {version && (
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
        <Skeleton width={100} height={24} />
      ) : blueprintUpdate ? (
        <BlueprintUpdateBadge
          blueprintUpdate={blueprintUpdate}
          service={service}
          serviceId={service.id}
          environmentId={environmentId}
          organizationId={organizationId}
          projectId={projectId}
        />
      ) : null}
    </div>
  )
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
            <LastVersion
              organizationId={organizationId}
              projectId={projectId}
              service={service}
              version={helmRepository.chart_version}
            />
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
    .with({ service: { serviceType: 'ARGOCD_APP' } }, () => null)
    .exhaustive()
  return cell
}

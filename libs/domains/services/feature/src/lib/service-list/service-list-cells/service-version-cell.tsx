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
import { ExternalLink, Icon, Tooltip, Truncate } from '@qovery/shared/ui'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'
import LastCommit from '../../last-commit/last-commit'
import LastVersion from '../../last-version/last-version'

type ServiceVersionCellProps = {
  service: AnyService
  organizationId: string
  projectId: string
}

export function ServiceVersionCell({ service, organizationId, projectId }: ServiceVersionCellProps) {
  const gitInfo = (service: Application | Job | Helm | Terraform, gitRepository?: ApplicationGitRepository) =>
    gitRepository && (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex w-44 flex-col gap-1.5">
          <span className="flex items-center gap-2 text-neutral-subtle">
            <Icon className="h-3 w-3 text-inherit" name={gitRepository.provider} />
            <ExternalLink
              href={gitRepository.url}
              underline
              color="neutral"
              size="ssm"
              withIcon={false}
              className="font-normal"
            >
              <Truncate text={gitRepository.name} truncateLimit={20} />
            </ExternalLink>
          </span>
          {gitRepository.branch && gitRepository.url && (
            <span className="flex items-center gap-2 text-neutral-subtle">
              <Icon className="h-3 w-3 text-inherit" iconName="code-branch" iconStyle="regular" />
              <ExternalLink
                href={buildGitProviderUrl(gitRepository.url, gitRepository.branch)}
                underline
                color="neutral"
                size="ssm"
                withIcon={false}
                className="font-normal"
              >
                <Truncate text={gitRepository.branch} truncateLimit={20} />
              </ExternalLink>
            </span>
          )}
        </div>
        <LastCommit
          organizationId={organizationId}
          projectId={projectId}
          gitRepository={gitRepository}
          service={service}
        />
      </div>
    )
  const containerInfo = (containerImage?: Pick<ContainerResponse, 'image_name' | 'tag' | 'registry'>) =>
    containerImage && (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex w-44 flex-col gap-1.5">
          <span className="flex items-center gap-2 text-neutral-350">
            <Icon width={16} name={containerRegistryKindToIcon(containerImage.registry.kind)} />
            <Tooltip
              content={
                <span className="text-center">
                  {containerImage.registry.name.length >= 20 && (
                    <>
                      {containerImage.registry.name} <br />
                    </>
                  )}{' '}
                  {containerImage.registry.url}
                </span>
              }
            >
              <span className="text-neutral-350">
                {containerImage.registry.name.length >= 20 ? (
                  <Truncate text={containerImage.registry.name.toLowerCase()} truncateLimit={20} />
                ) : (
                  containerImage.registry.name.toLowerCase()
                )}
              </span>
            </Tooltip>
          </span>
          <span className="flex items-center gap-2 text-neutral-350">
            <Icon width={16} name={IconEnum.CONTAINER} />
            <Truncate text={`${containerImage.image_name}`} truncateLimit={20} />
          </span>
        </div>
        {(service.serviceType === 'CONTAINER' ||
          (service.serviceType === 'JOB' && isJobContainerSource(service.source))) && (
          <LastVersion
            organizationId={organizationId}
            projectId={projectId}
            service={service}
            version={containerImage.tag}
          />
        )}
      </div>
    )

  const datasourceInfo = (datasource?: Pick<Database, 'accessibility' | 'mode' | 'type' | 'version'>) =>
    datasource && (
      <div className="flex flex-col gap-1.5 text-ssm text-neutral-350">
        <span className="flex items-center gap-2">
          <Icon name={datasource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />
          {datasource.type.toLowerCase().replace('sql', 'SQL').replace('db', 'DB')}
        </span>
        <span className="flex items-center gap-2">
          <Icon name={datasource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />v
          {datasource.version}
        </span>
      </div>
    )

  const helmInfo = (helmRepository?: HelmSourceRepositoryResponse) =>
    helmRepository && (
      <div className="flex items-center gap-1">
        <div className="flex w-44 flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
          <span className="flex gap-2">
            <Icon width={12} name={IconEnum.HELM_OFFICIAL} />
            <Tooltip
              content={
                <span className="text-center">
                  {helmRepository.repository?.name.length > 20 && (
                    <>
                      {helmRepository.repository?.name} <br />
                    </>
                  )}
                  {helmRepository.repository?.url}
                </span>
              }
            >
              <span className="text-neutral">
                {helmRepository.repository?.name.length > 20 ? (
                  <Truncate text={helmRepository.repository?.name.toLowerCase()} truncateLimit={20} />
                ) : (
                  helmRepository.repository?.name.toLowerCase()
                )}
              </span>
            </Tooltip>
          </span>
          <div className="flex gap-2">
            <Icon width={12} name={IconEnum.HELM_OFFICIAL} />
            <span className="text-neutral">
              <Truncate text={helmRepository.chart_name} truncateLimit={20} />
            </span>
          </div>
        </div>
        {service.serviceType === 'HELM' && (
          <LastVersion
            organizationId={organizationId}
            projectId={projectId}
            service={service}
            version={helmRepository.chart_version}
          />
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
    .exhaustive()
  return cell
}

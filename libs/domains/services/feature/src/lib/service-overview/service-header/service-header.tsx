import { useParams } from '@tanstack/react-router'
import { type ApplicationGitRepository, type Credentials, type Environment } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { P, match } from 'ts-pattern'
import {
  IconEnum,
  ServiceTypeEnum,
  isHelmGitSource,
  isHelmRepositorySource,
  isJobContainerSource,
  isJobGitSource,
} from '@qovery/shared/enums'
import { Badge, Button, ExternalLink, Heading, Icon, Skeleton, ToastEnum, Truncate, toast } from '@qovery/shared/ui'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { containerRegistryKindToIcon, upperCaseFirstLetter } from '@qovery/shared/util-js'
import AutoDeployBadge from '../../auto-deploy-badge/auto-deploy-badge'
import { useMasterCredentials } from '../../hooks/use-master-credentials/use-master-credentials'
import { useService } from '../../hooks/use-service/use-service'
import { getDatabaseConnectionUri } from '../../service-access-modal/service-access-modal'
import { ServiceActionToolbar } from '../../service-action-toolbar/service-action-toolbar'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import { ServiceLinksPopover } from '../../service-links-popover/service-links-popover'
import { ServiceStateChip } from '../../service-state-chip/service-state-chip'

export function GitRepository({ gitRepository }: { gitRepository: ApplicationGitRepository }) {
  return (
    <>
      {gitRepository.provider && (
        <Badge variant="outline" className="max-w-full gap-1 whitespace-nowrap">
          <Icon width={12} name={gitRepository.provider} />
          {match(gitRepository.provider)
            .with('GITHUB', () => 'GitHub')
            .with('GITLAB', () => 'GitLab')
            .with('BITBUCKET', () => 'Bitbucket')
            .otherwise(() => upperCaseFirstLetter(gitRepository.provider))}
        </Badge>
      )}
      {gitRepository.url && gitRepository.name && (
        <a href={buildGitProviderUrl(gitRepository.url)} target="_blank" rel="noopener noreferrer">
          <Button color="neutral" variant="outline" size="xs" className="text-nowrap">
            <Truncate text={gitRepository.name} truncateLimit={17} />
          </Button>
        </a>
      )}
      {gitRepository.branch && gitRepository.url && (
        <a
          href={buildGitProviderUrl(gitRepository.url, gitRepository.branch)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button color="neutral" variant="outline" size="xs" className="gap-1">
            <Icon iconName="code-branch" iconStyle="regular" height={14} width={14} />
            <Truncate text={gitRepository.branch} truncateLimit={17} />
          </Button>
        </a>
      )}
    </>
  )
}

export interface ServiceHeaderProps {
  environment: Environment
  serviceId: string
}

function ServiceHeaderSkeleton({ environment, serviceId }: ServiceHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton width={32} height={32} show rounded />
            <Skeleton width={160} height={24} show />
            <Skeleton width={86} height={24} show />
            <span className="mx-2 h-4 w-px bg-surface-neutral-component" />
            <div className="flex items-center gap-2 text-ssm">
              <Icon className="w-5" name={environment.cloud_provider.provider} />
              {environment.cluster_name}
            </div>
          </div>
          <ServiceActionToolbar environment={environment} serviceId={serviceId} />
        </div>
        <Skeleton width={480} height={20} show />
        <div className="mt-3 flex items-center gap-1">
          <Skeleton width={90} height={24} show />
          <Skeleton width={120} height={24} show />
          <Skeleton width={100} height={24} show />
          <Skeleton width={70} height={24} show />
          <Skeleton width={80} height={24} show />
        </div>
      </div>
      <hr className="border-neutral" />
    </div>
  )
}

function ServiceHeaderContent({ environment, serviceId }: ServiceHeaderProps) {
  const { organizationId = '', projectId = '' } = useParams({ strict: false })

  const { data: service } = useService({ environmentId: environment.id, serviceId, suspense: true })
  const { data: masterCredentials } = useMasterCredentials({ serviceId, serviceType: service?.serviceType })

  const [, copyToClipboard] = useCopyToClipboard()

  if (!service) {
    return null
  }

  const containerImage = match(service)
    .with({ serviceType: ServiceTypeEnum.JOB, source: P.when(isJobContainerSource) }, ({ source }) => source.image)
    .with({ serviceType: ServiceTypeEnum.CONTAINER }, ({ image_name, tag, registry }) => ({
      image_name,
      tag,
      registry,
    }))
    .otherwise(() => undefined)

  const helmRepository = match(service)
    .with({ serviceType: 'HELM', source: P.when(isHelmRepositorySource) }, ({ source }) => source.repository)
    .otherwise(() => undefined)

  const databaseSource = match(service)
    .with({ serviceType: ServiceTypeEnum.DATABASE }, ({ accessibility, mode, type, version }) => ({
      accessibility,
      mode,
      type,
      version,
      masterCredentials,
    }))
    .otherwise(() => undefined)

  const handleCopyCredentials = (credentials: Credentials) => {
    if (!databaseSource) {
      return
    }
    const connectionURI = getDatabaseConnectionUri(databaseSource, credentials)
    copyToClipboard(connectionURI)
    toast(ToastEnum.SUCCESS, 'Credentials copied to clipboard')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ServiceAvatar
              border="solid"
              size="sm"
              service={
                service.serviceType === 'JOB'
                  ? {
                      icon_uri: service.icon_uri ?? '',
                      serviceType: 'JOB' as const,
                      job_type: service.job_type,
                    }
                  : {
                      icon_uri: service.icon_uri ?? '',
                      serviceType: service.serviceType,
                    }
              }
            />
            <Heading>{service.name}</Heading>
            <ServiceStateChip className="ml-0.5" mode="running" environmentId={environment.id} serviceId={serviceId} />
            <span className="mx-2 h-4 w-px bg-surface-neutral-component" />
            <div className="flex items-center gap-2 text-ssm">
              <Icon className="w-5" name={environment.cloud_provider.provider} />
              {environment.cluster_name}
            </div>
          </div>
          <ServiceActionToolbar environment={environment} serviceId={serviceId} />
        </div>
        {service.description && <p className="text-neutral-subtle">{service.description}</p>}
        <div className="mt-3 flex items-center gap-1">
          {match(service)
            .with(
              { serviceType: 'APPLICATION' },
              {
                serviceType: 'JOB',
                source: P.when(isJobGitSource),
              },
              {
                serviceType: 'TERRAFORM',
              },
              {
                serviceType: 'HELM',
                source: P.when(isHelmGitSource),
              },
              (service) => {
                const gitRepository = match(service)
                  .with({ serviceType: 'APPLICATION' }, ({ git_repository }) => git_repository)
                  .with({ serviceType: 'JOB' }, ({ source }) => source.docker?.git_repository)
                  .with({ serviceType: 'HELM' }, ({ source }) => source.git?.git_repository)
                  .with(
                    { serviceType: 'TERRAFORM' },
                    ({ terraform_files_source }) => terraform_files_source?.git?.git_repository
                  )
                  .exhaustive()

                if (!gitRepository) {
                  return null
                }

                return <GitRepository gitRepository={gitRepository} />
              }
            )
            .otherwise(() => undefined)}
          {containerImage && (
            <>
              {containerImage.registry && (
                <ExternalLink
                  href={containerImage.registry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  color="neutral"
                  size="xs"
                  as="button"
                  className="gap-1"
                >
                  <Icon width={16} height={16} name={containerRegistryKindToIcon(containerImage.registry.kind)} />
                  <span className="truncate">
                    <Truncate text={containerImage.registry.name.toLowerCase()} truncateLimit={18} />
                  </span>
                </ExternalLink>
              )}
              <Badge variant="surface" className="max-w-full whitespace-nowrap">
                {containerImage.image_name}
              </Badge>
              <Badge variant="surface" className="max-w-full whitespace-nowrap">
                <Truncate text={containerImage.tag} truncateLimit={18} />
              </Badge>
            </>
          )}
          {helmRepository && (
            <>
              {helmRepository.repository && (
                <ExternalLink
                  href={helmRepository.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  color="neutral"
                  size="xs"
                  as="button"
                  className="gap-1"
                >
                  <Icon width={16} name={IconEnum.HELM_OFFICIAL} />
                  <Truncate text={helmRepository.repository.name ?? ''} truncateLimit={18} />
                </ExternalLink>
              )}
              <Badge variant="surface" className="items-center gap-1 text-nowrap capitalize">
                {helmRepository.chart_name}
              </Badge>
              <Badge variant="surface" className="items-center gap-1 text-nowrap capitalize">
                {helmRepository.chart_version}
              </Badge>
            </>
          )}
          {databaseSource && (
            <>
              <Badge variant="surface" className="items-center gap-1">
                <Icon name={databaseSource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />
                {databaseSource.version}
              </Badge>
              <Badge variant="surface">{databaseSource.mode.toLowerCase()}</Badge>
              <Badge variant="surface">{databaseSource.accessibility?.toLowerCase()}</Badge>
              {databaseSource.masterCredentials && (
                <Button
                  color="neutral"
                  variant="surface"
                  size="xs"
                  className="gap-1"
                  onClick={() => {
                    if (!databaseSource.masterCredentials) {
                      return
                    }
                    handleCopyCredentials(databaseSource.masterCredentials)
                  }}
                >
                  <Icon iconName="key" iconStyle="regular" />
                  Connection URI
                </Button>
              )}
            </>
          )}
          {'auto_deploy' in service &&
            service.auto_deploy &&
            match(service)
              .with({ serviceType: 'APPLICATION' }, { serviceType: 'TERRAFORM' }, () => (
                <AutoDeployBadge serviceId={service.id} />
              ))
              .with({ serviceType: 'JOB' }, (job) =>
                isJobGitSource(job.source) ? <AutoDeployBadge serviceId={service.id} /> : null
              )
              .with({ serviceType: 'HELM' }, (helm) =>
                isHelmGitSource(helm.source) ? <AutoDeployBadge serviceId={service.id} /> : null
              )
              .otherwise(() => null)}
          <ServiceLinksPopover
            organizationId={organizationId}
            projectId={projectId}
            environmentId={service.environment.id}
            serviceId={service.id}
          >
            <Button className="gap-1" size="xs" color="neutral" variant="outline">
              <Icon iconName="link" iconStyle="regular" />
              Links
              <Icon iconName="angle-down" iconStyle="regular" />
            </Button>
          </ServiceLinksPopover>
        </div>
      </div>
      <hr className="border-neutral" />
    </div>
  )
}

export function ServiceHeader(props: ServiceHeaderProps) {
  return (
    <Suspense fallback={<ServiceHeaderSkeleton {...props} />}>
      <ServiceHeaderContent {...props} />
    </Suspense>
  )
}

export default ServiceHeader

import { useParams } from '@tanstack/react-router'
import { type ApplicationGitRepository, type Credentials } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef } from 'react'
import { P, match } from 'ts-pattern'
import {
  IconEnum,
  ServiceTypeEnum,
  isHelmGitSource,
  isHelmRepositorySource,
  isJobContainerSource,
  isJobGitSource,
} from '@qovery/shared/enums'
import {
  APPLICATION_SETTINGS_RESOURCES_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL,
} from '@qovery/shared/routes'
import {
  Badge,
  Button,
  DescriptionDetails as Dd,
  DescriptionListRoot as Dl,
  DescriptionTerm as Dt,
  Heading,
  Icon,
  Link,
  Section,
  StatusChip,
  ToastEnum,
  Tooltip,
  Truncate,
  toast,
} from '@qovery/shared/ui'
import { buildGitProviderUrl } from '@qovery/shared/util-git'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import {
  containerRegistryKindToIcon,
  formatCronExpression,
  formatMetric,
  twMerge,
  upperCaseFirstLetter,
} from '@qovery/shared/util-js'
import { useMasterCredentials } from '../../hooks/use-master-credentials/use-master-credentials'
import { useRunningStatus } from '../../hooks/use-running-status/use-running-status'
import { useService } from '../../hooks/use-service/use-service'
import { getDatabaseConnectionUri } from '../../service-access-modal/service-access-modal'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import { ServiceLinksPopover } from '../../service-links-popover/service-links-popover'
import { ServiceHeaderSkeleton } from './service-header-skeleton'

function GitRepository({ gitRepository }: { gitRepository: ApplicationGitRepository }) {
  return (
    <>
      {gitRepository.provider && (
        <Badge variant="surface" className="max-w-full gap-1 whitespace-nowrap">
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

export interface ServiceHeaderProps extends ComponentPropsWithoutRef<'div'> {
  environmentId: string
  serviceId: string
}

export function ServiceHeader({ className, environmentId, serviceId, ...props }: ServiceHeaderProps) {
  const { organizationId = '', projectId = '' } = useParams({ strict: false })

  const { data: service } = useService({ environmentId, serviceId })
  const { data: masterCredentials } = useMasterCredentials({ serviceId, serviceType: service?.serviceType })
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })

  const [, copyToClipboard] = useCopyToClipboard()

  if (!service) {
    return <ServiceHeaderSkeleton className={className} {...props} />
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

  const ResourceUnit = ({ value, description }: { value?: string | number | null; description: string }) => {
    if (value === undefined || value === null) {
      return
    }
    return (
      <div className="grid-row-2 grid">
        <span className="text-base font-semibold text-neutral-400">{value}</span>
        <span className="text-xs">{description}</span>
      </div>
    )
  }

  const resources = match(service)
    .with({ serviceType: ServiceTypeEnum.CONTAINER }, { serviceType: ServiceTypeEnum.APPLICATION }, (s) => {
      const { cpu, memory, min_running_instances, max_running_instances, gpu } = s

      // Determine autoscaling mode using the same logic as other parts of the app
      let autoscalingMode = 'Fixed'
      if (s.autoscaling?.mode === 'KEDA') {
        autoscalingMode = 'KEDA'
      } else if (min_running_instances !== max_running_instances) {
        autoscalingMode = 'HPA'
      }

      const isFixed = autoscalingMode === 'Fixed'

      return (
        <>
          <ResourceUnit value={autoscalingMode} description="Scaling method" />
          <ResourceUnit
            value={
              Number.isNaN(min_running_instances) || Number.isNaN(max_running_instances)
                ? undefined
                : isFixed
                  ? `${min_running_instances}`
                  : `${min_running_instances}/${max_running_instances}`
            }
            description={isFixed ? 'Instances' : 'Instances (min/max)'}
          />
          <ResourceUnit value={cpu && formatMetric({ current: cpu, unit: 'mCPU' })} description="vCPU (max)" />
          <ResourceUnit value={memory && formatMetric({ current: memory, unit: 'MiB' })} description="Memory (max)" />
          <ResourceUnit value={gpu && formatMetric({ current: gpu, unit: 'GPU' })} description="GPU (max)" />
        </>
      )
    })
    .with({ serviceType: ServiceTypeEnum.DATABASE }, ({ cpu, memory, storage, instance_type, mode }) => (
      <>
        {mode !== 'MANAGED' && (
          <>
            <ResourceUnit value={cpu && formatMetric({ current: cpu, unit: 'mCPU' })} description="vCPU (max)" />
            <ResourceUnit value={memory && formatMetric({ current: memory, unit: 'MiB' })} description="Memory (max)" />
          </>
        )}
        <ResourceUnit value={storage && formatMetric({ current: storage, unit: 'GiB' })} description="Storage (max)" />
        {mode !== 'CONTAINER' && <ResourceUnit value={instance_type} description="Instance type" />}
      </>
    ))
    .with({ serviceType: ServiceTypeEnum.JOB }, (job) => {
      const { cpu, memory, max_duration_seconds, max_nb_restart, port, gpu } = job
      return (
        <>
          {match(job)
            .with({ job_type: 'LIFECYCLE' }, ({ schedule }) => (
              <ResourceUnit
                value={
                  [schedule.on_start && 'Deploy', schedule.on_stop && 'Stop', schedule.on_delete && 'Delete']
                    .filter(Boolean)
                    .join(' - ') || undefined
                }
                description="Triggered on"
              />
            ))
            .with({ job_type: 'CRON' }, ({ schedule }) => (
              <ResourceUnit
                value={formatCronExpression(schedule.cronjob?.scheduled_at)}
                description={`Scheduling (${schedule.cronjob?.timezone})`}
              />
            ))
            .exhaustive()}
          <ResourceUnit value={max_nb_restart} description="Restart (max)" />
          <ResourceUnit value={max_duration_seconds && `${max_duration_seconds} s`} description="Duration (max)" />
          <ResourceUnit value={cpu && formatMetric({ current: cpu, unit: 'mCPU' })} description="vCPU (max)" />
          <ResourceUnit value={memory && formatMetric({ current: memory, unit: 'MiB' })} description="Memory (max)" />
          <ResourceUnit value={gpu && formatMetric({ current: gpu, unit: 'GPU' })} description="GPU (max)" />
          <ResourceUnit value={port} description="Port" />
        </>
      )
    })
    .otherwise(() => null)

  const valuesOverride = match(service)
    .with({ serviceType: 'HELM' }, (service) => {
      const {
        values_override: { file, set, set_json, set_string },
      } = service
      const overrideWithArguments = (
        <span>Override with arguments: {set?.length || set_json?.length || set_string?.length ? 'Yes' : 'No'}</span>
      )

      if (file?.git?.git_repository) {
        return (
          <span>
            Type: Git repository
            <GitRepository gitRepository={file.git.git_repository} />
            {overrideWithArguments}
          </span>
        )
      } else if (file?.raw) {
        return (
          <span>
            Type: Raw YAML
            {overrideWithArguments}
          </span>
        )
      } else {
        return <span>{overrideWithArguments}</span>
      }
    })
    .otherwise(() => null)

  const sectionClassName = 'text-neutral gap-4 pl-8 pr-5'

  const handleCopyCredentials = (credentials: Credentials) => {
    if (!databaseSource) {
      return
    }
    const connectionURI = getDatabaseConnectionUri(databaseSource, credentials)
    copyToClipboard(connectionURI)
    toast(ToastEnum.SUCCESS, 'Credentials copied to clipboard')
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
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
            <StatusChip className="ml-0.5" status={runningStatus?.state} />
          </div>
          {service.description && <p className="text-neutral-subtle">{service.description}</p>}
          <div className="mt-3 flex items-center gap-2">
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
                  <a
                    href={containerImage.registry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-full"
                  >
                    <Badge variant="surface" className="max-w-full items-center gap-1 whitespace-nowrap capitalize">
                      <Icon width={16} name={containerRegistryKindToIcon(containerImage.registry.kind)} />
                      <span className="truncate">
                        <Truncate text={containerImage.registry.name.toLowerCase()} truncateLimit={18} />
                      </span>
                    </Badge>
                  </a>
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
              <Dl>
                {helmRepository.repository && (
                  <>
                    <Dt>Repository:</Dt>
                    <Dd>
                      <a href={helmRepository.repository.url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="surface" className="items-center gap-1 text-nowrap capitalize">
                          <Icon width={16} name={IconEnum.HELM_OFFICIAL} />
                          <Truncate text={helmRepository.repository.name ?? ''} truncateLimit={18} />
                        </Badge>
                      </a>
                    </Dd>
                  </>
                )}
                <Dt>Chart name:</Dt>
                <Dd>{helmRepository.chart_name}</Dd>
                <Dt>Target version:</Dt>
                <Dd>{helmRepository.chart_version}</Dd>
              </Dl>
            )}
            {databaseSource && (
              <Dl>
                <Dt>Type:</Dt>
                <Dd>
                  <Badge variant="surface" className="items-center gap-1">
                    <Icon name={databaseSource.type} className="max-h-[12px] max-w-[12px]" height={12} width={12} />
                    {databaseSource.version}
                  </Badge>
                </Dd>
                <Dt>Mode:</Dt>
                <Dd className="capitalize">{databaseSource.mode.toLowerCase()}</Dd>
                <Dt>Accessibility:</Dt>
                <Dd className="capitalize">{databaseSource.accessibility?.toLowerCase()}</Dd>
                {databaseSource.masterCredentials && (
                  <>
                    <Dt>Access:</Dt>
                    <Dd>
                      <Button
                        color="neutral"
                        variant="surface"
                        size="xs"
                        onClick={() =>
                          /* XXX: TS is not able to infer that masterCredentials cannot be undef */
                          handleCopyCredentials(databaseSource.masterCredentials!)
                        }
                      >
                        <Icon iconName="key" iconStyle="regular" className="mr-2" />
                        Connection URI
                      </Button>
                    </Dd>
                  </>
                )}
              </Dl>
            )}
            <ServiceLinksPopover
              organizationId={organizationId}
              projectId={projectId}
              environmentId={service.environment.id}
              serviceId={service.id}
            >
              <Button className="gap-1" size="xs" color="neutral" variant="surface">
                <Icon iconName="link" iconStyle="regular" />
                Links
                <Icon iconName="angle-down" iconStyle="regular" />
              </Button>
            </ServiceLinksPopover>
          </div>
        </div>
        <hr className="border-neutral" />
      </div>
      {resources && (
        <>
          <hr className="border-neutral" />
          <Section className={sectionClassName}>
            <div className="flex flex-row justify-between">
              {/* XXX: Should be Heading, typography & design wanted */}
              <span className="flex items-center gap-1 font-medium text-neutral-400">
                Resources
                <Tooltip content="This is based on the configuration of your service">
                  <span className="flex items-center">
                    <Icon iconName="circle-info" iconStyle="regular" className="text-xs text-neutral-350" />
                  </span>
                </Tooltip>
              </span>
              <Link
                as="button"
                color="current"
                to={`..${APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_RESOURCES_URL}`}
              >
                <Icon iconName="gear" iconStyle="regular" className="text-base text-neutral-350" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">{resources}</div>
          </Section>
        </>
      )}
      {valuesOverride && (
        <>
          <hr className="border-neutral-200" />
          <Section className={sectionClassName}>
            <div className="flex flex-row justify-between">
              {/* XXX: Should be Heading, typography & design wanted */}
              <span className="flex items-center gap-1 font-medium text-neutral-400">Values override</span>
              <Link
                as="button"
                color="current"
                to={`..${APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL}`}
              >
                <Icon iconName="gear" iconStyle="regular" className="text-base text-neutral-350" />
              </Link>
            </div>
            {valuesOverride}
          </Section>
        </>
      )}
    </>
  )
}

export default ServiceHeader

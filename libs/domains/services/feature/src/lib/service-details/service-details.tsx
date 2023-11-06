import { type Credentials } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef } from 'react'
import { P, match } from 'ts-pattern'
import { IconEnum, ServiceTypeEnum, isContainerSource, isGitSource } from '@qovery/shared/enums'
import { APPLICATION_SETTINGS_RESOURCES_URL, APPLICATION_SETTINGS_URL } from '@qovery/shared/routes'
import {
  Badge,
  Button,
  DescriptionDetails as Dd,
  DescriptionListRoot as Dl,
  DescriptionTerm as Dt,
  Icon,
  IconAwesomeEnum,
  Link,
  Section,
  ToastEnum,
  Tooltip,
  Truncate,
  toast,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { containerRegistryKindToIcon, formatCronExpression, formatMetric, twMerge } from '@qovery/shared/util-js'
import useMasterCredentials from '../hooks/use-master-credentials/use-master-credentials'
import { useService } from '../hooks/use-service/use-service'
import { LastCommitAuthor } from '../last-commit-author/last-commit-author'
import { LastCommit } from '../last-commit/last-commit'
import { ServiceDetailsSkeleton } from './service-details-skeleton'

export interface ServiceDetailsProps extends ComponentPropsWithoutRef<'div'> {
  environmentId: string
  serviceId: string
}

export function ServiceDetails({ className, environmentId, serviceId, ...props }: ServiceDetailsProps) {
  const { data: service } = useService({
    environmentId,
    serviceId,
  })
  const { data: masterCredentials } = useMasterCredentials({ serviceId, serviceType: service?.serviceType })
  const [, copyToClipboard] = useCopyToClipboard()

  if (!service) {
    return <ServiceDetailsSkeleton className={className} {...props} />
  }

  const containerImage = match(service)
    .with({ serviceType: ServiceTypeEnum.JOB, source: P.when(isContainerSource) }, ({ source }) => source.image)
    .with({ serviceType: ServiceTypeEnum.CONTAINER }, ({ image_name, tag, registry }) => ({
      image_name,
      tag,
      registry,
    }))
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
      <div className="grid grid-row-2">
        <span className="text-base text-neutral-400 font-semibold">{value}</span>
        <span className="text-xs">{description}</span>
      </div>
    )
  }

  const resources = match(service)
    .with(
      { serviceType: ServiceTypeEnum.CONTAINER },
      { serviceType: ServiceTypeEnum.APPLICATION },
      ({ cpu, memory, min_running_instances, max_running_instances }) => (
        <>
          <ResourceUnit
            value={
              Number.isNaN(min_running_instances) || Number.isNaN(max_running_instances)
                ? undefined
                : `${min_running_instances}/${max_running_instances}`
            }
            description="Instances (min/max)"
          />
          <ResourceUnit value={cpu && formatMetric({ current: cpu, unit: 'mCPU' })} description="vCPU (max)" />
          <ResourceUnit value={memory && formatMetric({ current: memory, unit: 'MiB' })} description="Memory (max)" />
        </>
      )
    )
    .with({ serviceType: ServiceTypeEnum.DATABASE }, ({ cpu, memory, storage, instance_type }) => (
      <>
        <ResourceUnit value={cpu && formatMetric({ current: cpu, unit: 'mCPU' })} description="vCPU (max)" />
        <ResourceUnit value={memory && formatMetric({ current: memory, unit: 'MiB' })} description="Memory (max)" />
        <ResourceUnit value={storage && formatMetric({ current: storage, unit: 'GiB' })} description="Storage (max)" />
        <ResourceUnit value={instance_type} description="Instance type" />
      </>
    ))
    .with(
      { serviceType: ServiceTypeEnum.JOB },
      ({ cpu, memory, max_duration_seconds, max_nb_restart, schedule, port }) => (
        <>
          <ResourceUnit
            value={
              [schedule?.on_start && 'Start', schedule?.on_stop && 'Stop', schedule?.on_delete && 'Delete']
                .filter(Boolean)
                .join(' - ') || undefined
            }
            description="Event"
          />
          <ResourceUnit value={formatCronExpression(schedule?.cronjob?.scheduled_at)} description="Scheduling" />
          <ResourceUnit value={max_nb_restart} description="Restart (max)" />
          <ResourceUnit value={max_duration_seconds && `${max_duration_seconds} s`} description="Duration (max)" />
          <ResourceUnit value={cpu && formatMetric({ current: cpu, unit: 'MiB' })} description="vCPU (max)" />
          <ResourceUnit value={memory && formatMetric({ current: memory, unit: 'MiB' })} description="Memory (max)" />
          <ResourceUnit value={port} description="Port" />
        </>
      )
    )
    .otherwise(() => null)

  const sectionClassName = 'text-neutral-350 gap-4 pl-8 pr-5'

  const handleCopyCredentials = (credentials: Credentials) => {
    const connectionURI = `${credentials?.login}:${credentials?.password}@${credentials?.host}:${credentials?.port}`
    copyToClipboard(connectionURI)
    toast(ToastEnum.SUCCESS, 'Credentials copied to clipboard')
  }

  return (
    <div className={twMerge('flex flex-col shrink-0 gap-5 py-8 text-sm', className)} {...props}>
      <Section className={sectionClassName}>
        {/* XXX: Should be Heading, typography & design wanted */}
        <span className="text-neutral-400 font-medium">About</span>
        <p>{service.description || 'No description provided yet'}</p>
        <Dl>
          <Dt>Created:</Dt>
          <Dd>{dateFullFormat(service.created_at)}</Dd>
          {service.updated_at && (
            <>
              <Dt>Last edit:</Dt>
              <Dd>
                <Tooltip content={dateFullFormat(service.updated_at)}>
                  <span>{timeAgo(new Date(service.updated_at))}</span>
                </Tooltip>
              </Dd>
            </>
          )}
        </Dl>
      </Section>
      <hr />
      <Section className={sectionClassName}>
        {/* XXX: Should be Heading, typography & design wanted */}
        <span className="text-neutral-400 font-medium">Source</span>
        {match(service)
          .with(
            { serviceType: ServiceTypeEnum.APPLICATION },
            {
              serviceType: ServiceTypeEnum.JOB,
              source: P.when(isGitSource),
            },
            (service) => {
              const gitRepository = match(service)
                .with({ serviceType: ServiceTypeEnum.APPLICATION }, ({ git_repository }) => git_repository)
                .with({ serviceType: ServiceTypeEnum.JOB }, ({ source }) => source.docker?.git_repository)
                .exhaustive()

              return (
                gitRepository && (
                  <Dl>
                    {gitRepository.url && gitRepository.name && (
                      <>
                        <Dt>Repository:</Dt>
                        <Dd>
                          <a href={gitRepository.url} target="_blank" rel="noopener noreferrer">
                            <Badge variant="surface" size="xs" className="gap-1">
                              <Icon
                                name={
                                  gitRepository.url.includes('//github')
                                    ? IconEnum.GITHUB
                                    : gitRepository.url.includes('//bitbucket')
                                    ? IconEnum.BITBUCKET
                                    : IconEnum.GITLAB
                                }
                                height={14}
                                width={14}
                              />
                              <Truncate text={gitRepository.name} truncateLimit={18} />
                            </Badge>
                          </a>
                        </Dd>
                      </>
                    )}
                    {gitRepository.branch && (
                      <>
                        <Dt>Branch:</Dt>
                        <Dd>
                          <Badge variant="surface" size="xs" className="gap-1">
                            <Icon name={IconAwesomeEnum.CODE_BRANCH} height={14} width={14} />
                            <Truncate text={gitRepository.branch} truncateLimit={18} />
                          </Badge>
                        </Dd>
                      </>
                    )}
                    <Dt>Commit:</Dt>
                    <Dd>
                      <div className="inline-flex items-center gap-2">
                        <LastCommitAuthor
                          gitRepository={gitRepository}
                          serviceId={serviceId}
                          serviceType={service.serviceType}
                        />
                        <LastCommit
                          gitRepository={gitRepository}
                          serviceId={serviceId}
                          serviceType={service.serviceType}
                        />
                      </div>
                    </Dd>
                  </Dl>
                )
              )
            }
          )
          .otherwise(() => undefined)}
        {containerImage && (
          <Dl>
            {containerImage.registry && (
              <>
                <Dt>Registry:</Dt>
                <Dd>
                  <a href={containerImage.registry.url} target="_blank" rel="noopener noreferrer">
                    <Badge variant="surface" size="xs" className="items-center gap-1 capitalize">
                      <Icon width={16} name={containerRegistryKindToIcon(containerImage.registry.kind)} />
                      <Truncate text={containerImage.registry.name.toLowerCase()} truncateLimit={18} />
                    </Badge>
                  </a>
                </Dd>
              </>
            )}
            <Dt>Image name:</Dt>
            <Dd>{containerImage.image_name}</Dd>
            <Dt>Tag:</Dt>
            <Dd>{containerImage.tag}</Dd>
          </Dl>
        )}
        {databaseSource && (
          <Dl>
            <Dt>Type:</Dt>
            <Dd>
              <Badge size="xs" variant="surface" className="items-center gap-1">
                <Icon name={databaseSource.type} className="max-w-[12px] max-h-[12px]" height={12} width={12} />
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
                    <Icon name={IconAwesomeEnum.KEY} className="mr-2" />
                    Connection URI
                  </Button>
                </Dd>
              </>
            )}
          </Dl>
        )}
      </Section>
      {resources && (
        <>
          <hr />
          <Section className={sectionClassName}>
            <div className="flex flex-row justify-between">
              {/* XXX: Should be Heading, typography & design wanted */}
              <span className="flex items-center gap-1 text-neutral-400 font-medium">
                Resources
                <Tooltip content="This is based on the configuration of your service">
                  <span className="flex items-center">
                    <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-xs text-neutral-350" />
                  </span>
                </Tooltip>
              </span>
              <Link
                color="current"
                to={`..${APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_RESOURCES_URL}`}
                relative="path"
              >
                <Icon name={IconAwesomeEnum.WHEEL} className="text-base text-neutral-300" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">{resources}</div>
          </Section>
        </>
      )}
    </div>
  )
}

export default ServiceDetails

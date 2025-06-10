import { type PodStatusDto, type ServiceMetricsDto } from 'qovery-ws-typescript-axios'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import {
  DescriptionDetails as Dd,
  DescriptionListRoot as Dl,
  DescriptionTerm as Dt,
  Icon,
  Link,
  TabsPrimitives,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { getServiceStateColor } from '@qovery/shared/util-services'

const { Tabs } = TabsPrimitives

export interface Pod extends Partial<ServiceMetricsDto>, Partial<PodStatusDto> {
  podName: string
}

function TimelineCircle() {
  return (
    <span className="relative top-[1px] z-0 inline-flex h-4 w-4 items-center justify-center bg-neutral-700 before:block before:h-1.5 before:w-1.5 before:rounded-full before:bg-neutral-300" />
  )
}

export interface PodDetailsProps {
  pod: Pod
  serviceId: string
  serviceType: ServiceType
}

export function PodDetails({ pod, serviceId, serviceType }: PodDetailsProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const QOVERY_SIDECAR_NAME = 'qovery-wait-container-output' as const
  const { containers = [] } = pod

  const filteredContainers = containers.filter(({ name }) => name !== QOVERY_SIDECAR_NAME)
  const defaultContainer = filteredContainers[0]?.name

  return (
    <div className="dark relative flex flex-col gap-y-3 overflow-hidden pb-4 pl-4 pr-20 pt-3">
      <div className="absolute left-[23.5px] top-8 h-[calc(100%-48px)] w-[1px] gap-2 bg-neutral-300" />
      <Link
        to={
          ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
          SERVICE_LOGS_URL(
            serviceId,
            match(serviceType)
              // TODO: Job are a bit quirky because job_name and pod_name are mixed up and we are not able to filter by job_name currently.
              // So we chose to disable log filter by pod for Jobs
              .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => undefined)
              .otherwise(() => pod.name)
          )
        }
        className="absolute right-2 top-2 gap-2"
        as="button"
        type="button"
        size="sm"
        color="neutral"
        variant="surface"
      >
        Logs
        <Icon iconName="scroll" />
      </Link>
      {containers.length ? (
        <Tabs.Root defaultValue={defaultContainer}>
          <Tabs.List className={serviceType !== 'HELM' ? 'hidden' : ''}>
            {filteredContainers.map(({ name, current_state }) => (
              <Tabs.Trigger key={name} value={name} size="xs" radius="full">
                <div
                  className={`mr-1 h-1.5 w-1.5 rounded-full ${getServiceStateColor(
                    current_state?.state,
                    'background'
                  )}`}
                />
                {name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="mt-3">
            {filteredContainers.map(({ current_state, last_terminated_state, restart_count, name, image }) => (
              <Tabs.Content key={name} value={name}>
                <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-x-2 gap-y-0">
                  {serviceType === 'HELM' && (
                    <>
                      <Dt className="col-span-2 mb-2">Container image:</Dt>
                      <Dd className="mb-2 flex gap-1">{image}</Dd>
                    </>
                  )}
                  <TimelineCircle />
                  <Dt className={last_terminated_state ? 'mb-2' : ''}>Current status:</Dt>
                  <Dd className={last_terminated_state ? 'mb-2' : ''}>
                    {current_state?.state === 'RUNNING' ? (
                      <span>
                        <span role="img" aria-label="Checkmark">
                          ✅
                        </span>{' '}
                        Running
                      </span>
                    ) : (
                      <span className="flex gap-1.5">
                        {pod.state === 'ERROR' ? (
                          <span role="img" aria-label="Error">
                            ❌
                          </span>
                        ) : (
                          ''
                        )}
                        <span>
                          {current_state?.state_reason}
                          {current_state?.state_message ? `:${current_state.state_message}` : ''}
                          {restart_count && !last_terminated_state ? (
                            <>
                              <br />
                              The container has restarted {restart_count} {pluralize(restart_count, 'time')} since the
                              last deployment.
                            </>
                          ) : undefined}
                        </span>
                      </span>
                    )}
                  </Dd>
                  {last_terminated_state && (
                    <>
                      <TimelineCircle />
                      <Dt className="mb-2">State reason:</Dt>
                      <Dd className="mb-2">{upperCaseFirstLetter(last_terminated_state.reason)}</Dd>
                      <TimelineCircle />
                      <Dt className="mb-2">State message:</Dt>
                      <Dd>
                        {upperCaseFirstLetter(last_terminated_state.exit_code_message)} (
                        {last_terminated_state.exit_code}).
                        {restart_count ? (
                          <>
                            <br />
                            The container has restarted {restart_count} {pluralize(restart_count, 'time')} since the
                            last deployment.
                          </>
                        ) : undefined}{' '}
                        If you want to clear this warning state, redeploy the service.
                      </Dd>
                    </>
                  )}
                </Dl>
              </Tabs.Content>
            ))}
          </div>
        </Tabs.Root>
      ) : (
        <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-x-2 gap-y-0">
          <TimelineCircle />
          <Dt>Current status:</Dt>
          <Dd>
            {pod.state === 'RUNNING' ? (
              <span>
                <span role="img" aria-label="checkmark">
                  ✅
                </span>{' '}
                Running
              </span>
            ) : (
              <span className="flex gap-1.5">
                {pod.state === 'ERROR' ? (
                  <span role="img" aria-label="Error">
                    ❌
                  </span>
                ) : (
                  ''
                )}
                <span>
                  {pod.state_reason}
                  {pod.state_message ? `:${pod.state_message}` : ''}
                  {pod.restart_count ? (
                    <>
                      <br />
                      The pod has restarted {pod.restart_count} {pluralize(pod.restart_count, 'time')} since the last
                      deployment.
                    </>
                  ) : undefined}
                </span>
              </span>
            )}
          </Dd>
        </Dl>
      )}
      {pod.last_events &&
        pod.last_events?.length > 0 &&
        pod.last_events?.map((event, index) => (
          <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-x-2 gap-y-0" key={event.created_at + index}>
            <TimelineCircle />
            <Dt>{dateFullFormat(event.created_at, undefined, 'dd MMM, HH:mm:ss')}</Dt>
            <Dd className="flex gap-1.5">
              <span>
                {event.type.includes('Warning') ? (
                  <span role="img" aria-label="Warning">
                    ⚠️
                  </span>
                ) : (
                  <Icon iconName="info-circle" iconStyle="regular" />
                )}
              </span>
              {event.reason} - {event.message}
            </Dd>
          </Dl>
        ))}
    </div>
  )
}

export default PodDetails

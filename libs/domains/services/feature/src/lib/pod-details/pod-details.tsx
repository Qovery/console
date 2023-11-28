import { type PodStatusDto, type ServiceMetricsDto } from 'qovery-ws-typescript-axios'
import { useParams } from 'react-router-dom'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { getServiceStateColor } from '@qovery/domains/services/util'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import {
  Button,
  DescriptionDetails as Dd,
  DescriptionListRoot as Dl,
  DescriptionTerm as Dt,
  Icon,
  IconAwesomeEnum,
  Link,
  TabsPrimitives,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'

const { Tabs } = TabsPrimitives

export interface Pod extends Partial<ServiceMetricsDto>, Partial<PodStatusDto> {
  podName: string
}

function TimelineCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="z-10 bg-neutral-550"
    >
      <circle cx="8" cy="8" r="3.75" stroke="#67778E" strokeWidth="1.5" />
    </svg>
  )
}

export interface PodDetailsProps {
  pod: Pod
  serviceId: string
  serviceType: ServiceType
}

export function PodDetails({ pod: { containers = [] }, serviceId, serviceType }: PodDetailsProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const QOVERY_SIDECAR_NAME = 'qovery-wait-container-output' as const

  return (
    <div className="pl-4 pb-4 pt-3 pr-20 relative">
      <Link
        to={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId)}
        className="absolute top-2 right-2"
      >
        <Button type="button" size="sm" color="neutral" variant="surface" className="gap-2">
          Logs
          <Icon name={IconAwesomeEnum.SCROLL} />
        </Button>
      </Link>
      <Tabs.Root defaultValue={containers[0].name}>
        <Tabs.List className={serviceType !== 'HELM' ? 'hidden' : ''}>
          {containers
            .filter(({ name }) => name !== QOVERY_SIDECAR_NAME)
            .map(({ name, current_state }) => (
              <Tabs.Trigger key={name} value={name} size="xs" radius="full">
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1 ${getServiceStateColor(
                    current_state?.state,
                    'background'
                  )}`}
                />
                {name}
              </Tabs.Trigger>
            ))}
        </Tabs.List>
        <div className="mt-3">
          {containers
            .filter(({ name }) => name !== QOVERY_SIDECAR_NAME)
            .map(({ current_state, last_terminated_state, restart_count, name, image }) => (
              <Tabs.Content key={name} value={name}>
                <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-y-0 gap-x-2">
                  {serviceType === 'HELM' && (
                    <>
                      <Dt className="col-span-2 mb-2">Container image:</Dt>
                      <Dd className="flex gap-1 mb-2">{image}</Dd>
                    </>
                  )}
                  <div className="relative flex flex-col items-center">
                    {last_terminated_state && (
                      <div className="absolute min-h-full border-l border-neutral-350 left-1/2 -translate-x-1/2"></div>
                    )}
                    <div className="grid gap-2 items-center">
                      <TimelineCircle />
                    </div>
                  </div>
                  <Dt className={last_terminated_state ? 'mb-2' : ''}>Current status:</Dt>
                  <Dd className={last_terminated_state ? 'mb-2' : ''}>
                    {current_state?.state === 'RUNNING' ? (
                      <span className="text-green-500">Running</span>
                    ) : (
                      <span className={current_state?.state === 'ERROR' ? 'text-red-500' : ''}>
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
                    )}
                  </Dd>
                  {last_terminated_state && (
                    <>
                      <div className="relative flex flex-col items-center">
                        <div className="absolute min-h-full border-l border-neutral-350 left-1/2 -translate-x-1/2"></div>
                        <div className="grid gap-2">
                          <TimelineCircle />
                        </div>
                      </div>
                      <Dt>{last_terminated_state.finished_at && dateFullFormat(last_terminated_state.finished_at)}</Dt>
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
    </div>
  )
}

export default PodDetails

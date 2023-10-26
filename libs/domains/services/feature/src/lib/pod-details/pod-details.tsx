import { type PodStatusDto, type ServiceMetricsDto } from 'qovery-ws-typescript-axios'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import {
  Button,
  DescriptionDetails as Dd,
  DescriptionListRoot as Dl,
  DescriptionTerm as Dt,
  Icon,
  IconAwesomeEnum,
  Link,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'

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
  isGitBased: boolean
}

export function PodDetails({ pod: { containers = [], service_version }, serviceId, isGitBased }: PodDetailsProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const QOVERY_SIDECAR_NAME = 'qovery-wait-container-output' as const
  return (
    <div className="pl-4 pb-4 pt-3 pr-20 relative">
      <Link
        to={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId)}
        className="absolute top-2 right-2"
      >
        <Button type="button" color="neutral" variant="surface" className="gap-2">
          Logs
          <Icon name={IconAwesomeEnum.SCROLL} />
        </Button>
      </Link>
      {containers
        .filter(({ name }) => name !== QOVERY_SIDECAR_NAME)
        .map(({ current_state, last_terminated_state, restart_count, name }) => (
          <Fragment key={name}>
            <Dl className="grid-cols-[20px_100px_minmax(0,_1fr)] gap-y-0 gap-x-2">
              {
                // TODO: Code not used now but will be soon with Helm services
                // eslint-disable-next-line no-constant-condition
                false ? (
                  <>
                    <Dt className="col-span-2 mb-2">Container version:</Dt>
                    <Dd className="flex gap-1 mb-2">
                      {isGitBased ? (
                        <>
                          <Icon name={IconAwesomeEnum.CODE_COMMIT} />
                          {service_version?.substring(0, 7)}
                        </>
                      ) : (
                        service_version
                      )}
                    </Dd>
                  </>
                ) : (
                  <span className="col-span-3 text-neutral-300 mb-2">Pod status history:</span>
                )
              }
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
                    {restart_count ? (
                      <>
                        <br />
                        The container has restarted {restart_count} {pluralize(restart_count, 'time')} since the last
                        deployment.
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
                    {upperCaseFirstLetter(last_terminated_state.exit_code_message)} ({last_terminated_state.exit_code}).
                    {restart_count ? (
                      <>
                        <br />
                        The container has restarted {restart_count} {pluralize(restart_count, 'time')} since the last
                        deployment.
                      </>
                    ) : undefined}{' '}
                    If you want to clear this warning state, redeploy the service.
                  </Dd>
                </>
              )}
            </Dl>
          </Fragment>
        ))}
    </div>
  )
}

export default PodDetails

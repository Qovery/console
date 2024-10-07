import { PodStatusesCallout, PodsMetrics, ServiceDetails } from '@qovery/domains/services/feature'
import { OutputVariables } from '@qovery/domains/variables/feature'
import { ExternalLink, Icon } from '@qovery/shared/ui'

export interface PageGeneralProps {
  serviceId: string
  environmentId: string
  isCronJob: boolean
  isLifecycleJob: boolean
}

export function PageGeneral({ serviceId, environmentId, isCronJob, isLifecycleJob }: PageGeneralProps) {
  return (
    <div className="flex grow flex-row">
      <div className="flex min-h-0 flex-1 grow flex-col gap-6 overflow-y-auto px-10 py-7">
        <PodStatusesCallout environmentId={environmentId} serviceId={serviceId} />
        <PodsMetrics environmentId={environmentId} serviceId={serviceId}>
          {isCronJob && (
            <div className="grid grid-cols-[min-content_1fr] gap-x-3 gap-y-1 rounded border border-neutral-250 bg-neutral-100 p-3 text-xs text-neutral-350">
              <Icon className="row-span-2" iconName="circle-info" iconStyle="regular" />
              <p>
                The number of past Completed or Failed job execution retained in the history and their TTL can be
                customized in the advanced settings.
              </p>
              <ExternalLink
                className="text-xs"
                href="https://hub.qovery.com/docs/using-qovery/configuration/advanced-settings/#cronjobfailed_job_history_limit"
              >
                See documentation
              </ExternalLink>
            </div>
          )}
        </PodsMetrics>
        {isLifecycleJob && <OutputVariables serviceId={serviceId} />}
      </div>
      <ServiceDetails
        className="w-1/4 max-w-[360px] flex-1 border-l"
        environmentId={environmentId}
        serviceId={serviceId}
      />
    </div>
  )
}

export default PageGeneral

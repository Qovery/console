import { PodStatusesCallout, PodsMetrics, ServiceDetails } from '@qovery/domains/services/feature'
import { OutputVariables } from '@qovery/domains/variables/feature'
import { ExternalLink, Icon } from '@qovery/shared/ui'

export interface PageGeneralProps {
  serviceId: string
  environmentId: string
  isCronJob: boolean
}

export function PageGeneral({ serviceId, environmentId, isCronJob }: PageGeneralProps) {
  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex flex-col grow">
        <div className="flex flex-row grow">
          <div className="py-7 px-10 flex flex-col grow overflow-y-auto min-h-0 gap-6">
            <PodStatusesCallout environmentId={environmentId} serviceId={serviceId} />
            <PodsMetrics environmentId={environmentId} serviceId={serviceId}>
              {isCronJob && (
                <div className="grid grid-cols-[min-content_1fr] gap-x-3 gap-y-1 p-3 border rounded border-neutral-250 text-xs text-neutral-350 bg-neutral-100">
                  <Icon className="row-span-2" iconName="circle-info" />
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
            <OutputVariables serviceId={serviceId} />
          </div>
          <ServiceDetails className="w-[360px] border-l" environmentId={environmentId} serviceId={serviceId} />
        </div>
      </div>
    </div>
  )
}

export default PageGeneral

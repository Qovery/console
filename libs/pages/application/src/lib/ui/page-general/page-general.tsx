import { useParams } from 'react-router-dom'
import { PodStatusesCallout, PodsMetrics, ServiceDetails } from '@qovery/domains/services/feature'
import { type BaseLink, ExternalLink, HelpSection, Icon, IconAwesomeEnum } from '@qovery/shared/ui'

export interface PageGeneralProps {
  listHelpfulLinks: BaseLink[]
  isCronJob: boolean
}

export function PageGeneral(props: PageGeneralProps) {
  const { isCronJob, listHelpfulLinks } = props
  const { environmentId = '', applicationId = '' } = useParams()

  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex flex-col grow">
        <div className="flex flex-row grow">
          <div className="py-7 px-10 flex flex-col grow overflow-y-auto min-h-0 gap-6">
            {applicationId && environmentId && (
              <>
                <PodStatusesCallout environmentId={environmentId} serviceId={applicationId} />
                <PodsMetrics environmentId={environmentId} serviceId={applicationId} />
              </>
            )}
            {isCronJob && (
              <div className="grid grid-cols-[min-content_1fr] gap-x-3 gap-y-1 p-3 border rounded border-neutral-250 text-xs text-neutral-350 bg-neutral-100">
                <Icon className="row-span-2" name={IconAwesomeEnum.CIRCLE_INFO} />
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
          </div>
          <ServiceDetails className="w-[360px] border-l" environmentId={environmentId} serviceId={applicationId} />
        </div>
        <div className="bg-white rounded-b flex flex-col justify-end">
          <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
        </div>
      </div>
    </div>
  )
}

export default PageGeneral

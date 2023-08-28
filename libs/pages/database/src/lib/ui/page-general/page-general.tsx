import { DatabaseModeEnum, StateEnum } from 'qovery-typescript-axios'
import { PodsMetrics } from '@qovery/domains/services/feature'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { type DatabaseEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { type BaseLink, HelpSection, Skeleton } from '@qovery/shared/ui'
import About from '../about/about'

export interface PageGeneralProps {
  database?: DatabaseEntity
  listHelpfulLinks: BaseLink[]
  loadingStatus?: LoadingStatus
}

export function PageGeneral(props: PageGeneralProps) {
  const { database, listHelpfulLinks, loadingStatus } = props

  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: database?.environment?.id,
    serviceId: database?.id,
  })

  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow overflow-auto">
          {database?.mode && database?.mode === DatabaseModeEnum.MANAGED && (
            <p className="text-sm text-neutral-400 font-medium mb-4">
              Metrics for Managed Databases can be found directly on your cloud provider dashboard
            </p>
          )}
          <div className="flex border border-neutral-200 mb-4">
            <div className="flex-1 border-r border-neutral-200 p-5">
              <Skeleton height={16} width={48} show={false}>
                <div className="text-neutral-400 font-bold">
                  {database?.mode === DatabaseModeEnum.MANAGED
                    ? 'N / A'
                    : `${deploymentStatus?.state === StateEnum.DEPLOYED ? 1 : 0} / 1`}
                </div>
              </Skeleton>
              <span className="text-xs text-neutral-350 font-medium">Running instances</span>
            </div>
            <div className="flex-1 p-5">
              <div className="text-neutral-400 font-bold">
                {database?.mode === DatabaseModeEnum.MANAGED ? 'N / A' : '-' /** TODO: implem real metrics **/}
              </div>
              <span className="text-xs text-neutral-350 font-medium">Service restart</span>
            </div>
          </div>

          {database && database.environment && (
            <PodsMetrics environmentId={database.environment.id} serviceId={database.id} />
          )}
        </div>
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
      <div className="w-right-help-sidebar py-10 border-l border-neutral-200">
        <About
          description={database?.description}
          type={database?.type}
          version={database?.version}
          mode={database?.mode}
          accessibility={database?.accessibility}
          credentials={database?.credentials?.items}
          loadingStatus={loadingStatus}
        />
      </div>
    </div>
  )
}

export default PageGeneral

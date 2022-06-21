import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { BaseLink, HelpSection, Icon, Skeleton, Tooltip } from '@console/shared/ui'
import About from '../about/about'
import InstancesTable from '../instances-table/instances-table'
import LastCommitFeature from '../../feature/last-commit-feature/last-commit-feature'

export interface PageGeneralProps {
  application?: ApplicationEntity
  listHelpfulLinks: BaseLink[]
  loadingStatus?: LoadingStatus
  serviceStability?: number
}

export function PageGeneral(props: PageGeneralProps) {
  const { application, listHelpfulLinks, loadingStatus, serviceStability = 0 } = props

  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow overflow-auto">
          <div className="flex border border-element-light-lighter-400 mb-4">
            <div className="flex-1 border-r border-element-light-lighter-400 px-6 py-3">
              <strong className="text-sm mb-1 text-text-400">Running Instances</strong>
              <Skeleton height={16} width={48} show={application?.instances?.loadingStatus === 'loading'}>
                <div className="h4 text-black">{application?.instances?.items?.length || '–'}</div>
              </Skeleton>
            </div>
            <div className="flex-1  px-6 py-3">
              <strong className="text-sm mb-1 text-text-400">Service Stability</strong>
              <div className="h4 text-black flex items-center gap-2">
                {serviceStability}{' '}
                <Tooltip
                  side="right"
                  content="Number of application instance restarts since the last rollout due to application errors"
                >
                  <div className="flex items-center">
                    <Icon className="text-caption text-element-light-lighter-700" name="icon-solid-circle-info"></Icon>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>

          {application?.instances && application?.instances.items?.length && (
            <InstancesTable instances={application?.instances.items} />
          )}
        </div>
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
      <div className="w-right-help-sidebar py-10 border-l border-element-light-lighter-400">
        <About
          description={application?.description || ''}
          link={{
            link: application?.git_repository?.url || '',
            linkLabel: application?.git_repository?.provider,
            external: true,
          }}
          buildMode={application?.build_mode}
          gitProvider={application?.git_repository?.provider}
          loadingStatus={loadingStatus}
        />
        <LastCommitFeature />
      </div>
    </div>
  )
}

export default PageGeneral

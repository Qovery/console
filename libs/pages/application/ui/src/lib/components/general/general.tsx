/* eslint-disable-next-line */
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { BaseLink, HelpSection, Skeleton } from '@console/shared/ui'
import About from '../about/about'
import InstancesTable from '../instances-table/instances-table'
import LastCommit from '../last-commit/last-commit'

export interface GeneralProps {
  application?: ApplicationEntity
  listHelpfulLinks: BaseLink[]
  loadingStatus?: LoadingStatus
  commitDeltaCount?: number
}

export function GeneralPage(props: GeneralProps) {
  const { application, listHelpfulLinks, loadingStatus, commitDeltaCount } = props

  return (
    <div className="mt-2 bg-white rounded flex flex-grow">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow">
          <div className="flex border border-element-light-lighter-400 mb-4">
            <div className="flex-1 border-r border-element-light-lighter-400 px-6 py-3">
              <strong className="text-sm mb-1 text-text-400">Running Instances</strong>
              <Skeleton height={16} width={48} show={application?.instances?.loadingStatus === 'loading'}>
                <div className="h4 text-black">{application?.instances?.items?.length || '–'}</div>
              </Skeleton>
            </div>
            <div className="flex-1  px-6 py-3">
              <strong className="text-sm mb-1 text-text-400">Service Stability</strong>
              <div className="h4 text-black">–</div>
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
        <LastCommit
          commit={application?.commits?.items && application?.commits?.items[0]}
          loadingStatus={application?.commits?.loadingStatus}
          commitDeltaCount={commitDeltaCount}
        />
      </div>
    </div>
  )
}

export default GeneralPage

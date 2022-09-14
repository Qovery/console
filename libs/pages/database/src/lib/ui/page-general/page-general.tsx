import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { BaseLink, HelpSection, Skeleton } from '@qovery/shared/ui'
import About from '../about/about'
import InstancesTable from '../instances-table/instances-table'

export interface PageGeneralProps {
  database?: DatabaseEntity
  listHelpfulLinks: BaseLink[]
  loadingStatus?: LoadingStatus
}

export function PageGeneral(props: PageGeneralProps) {
  const { database, listHelpfulLinks, loadingStatus } = props

  /**
   * @TODO Have to type to any since the InstancesTable component does not support anything else than Instance
   * Which are not the same model as the instances returned for the databases that do not have names and have storage
   * thanks to the fetchCurrentMetric call
   *
   * There might be something to do with the API doc here
   */
  let items: any[]

  if (database?.mode === DatabaseModeEnum.MANAGED) {
    items = [
      {
        created_at: '',
        name: '',
        cpu: {},
        memory: {},
      },
    ]
  } else {
    items = [
      {
        name: '-',
        cpu: database?.metrics?.data?.cpu,
        memory: database?.metrics?.data?.memory,
        storage: database?.metrics?.data?.storage,
      },
    ]
  }

  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow overflow-auto">
          {database?.mode && database?.mode === DatabaseModeEnum.MANAGED && (
            <p className="text-sm text-text-700 font-medium mb-4">
              Metrics for Managed Databases can be found directly on your cloud provider dashboard
            </p>
          )}
          <div className="flex border border-element-light-lighter-400 mb-4">
            <div className="flex-1 border-r border-element-light-lighter-400 p-5">
              <Skeleton height={16} width={48} show={false}>
                <div className="text-text-600 font-bold">
                  {database?.mode === DatabaseModeEnum.MANAGED ? 'N / A' : '1 / 1'}
                </div>
              </Skeleton>
              <span className="text-xs text-text-400 font-medium">Running instances</span>
            </div>
            <div className="flex-1 p-5">
              <div className="text-text-600 font-bold">
                {database?.mode === DatabaseModeEnum.MANAGED ? 'N / A' : '-'}
              </div>
              <span className="text-xs text-text-400 font-medium">Service restart</span>
            </div>
          </div>

          <InstancesTable mode={database?.mode} instances={items} />
        </div>
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
      <div className="w-right-help-sidebar py-10 border-l border-element-light-lighter-400">
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

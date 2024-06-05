import { type DeploymentHistoryApplication } from 'qovery-typescript-axios'
import { memo, useEffect, useState } from 'react'
import { EmptyState, Table, type TableFilterProps, TableRowDeployment } from '@qovery/shared/ui'

export interface PageDeploymentsProps {
  deployments?: DeploymentHistoryApplication[]
  isLoading?: boolean
}

export function Deployments(props: PageDeploymentsProps) {
  const { deployments = [], isLoading = true } = props

  const [data, setData] = useState<DeploymentHistoryApplication[]>(deployments)
  const [filter, setFilter] = useState<TableFilterProps[]>([])

  useEffect(() => {
    deployments && setData(deployments)
  }, [deployments])

  const tableHead = [
    {
      title: 'Execution ID',
      className: 'px-4 py-2 bg-white h-full',
      filter: [
        {
          search: true,
          title: 'Filter by id',
          key: 'id',
        },
      ],
    },
    {
      title: 'Status',
      className: 'px-4 py-2 bg-white h-full',
      filter: [
        {
          search: true,
          title: 'Filter by status',
          key: 'status',
        },
      ],
    },
    {
      title: 'Update',
      className: 'px-4 py-2 bg-white h-full flex items-center',
      sort: {
        key: 'updated_at',
      },
    },
    {
      title: 'Version',
      className: 'px-4 py-2 border-b-neutral-200 border-l h-full bg-white',
    },
  ]

  if (!isLoading && deployments.length === 0)
    return (
      <div className="mt-2 h-full rounded-t-sm bg-neutral-50">
        <EmptyState
          className="m-auto mt-12 w-[420px]"
          title="No deployment yet"
          description="You need to deploy your service to see this tab."
        />
      </div>
    )

  return (
    <Table dataHead={tableHead} data={deployments} setFilter={setFilter} filter={filter} setDataSort={setData}>
      <div>
        {data?.map((currentData, index) => (
          <TableRowDeployment
            key={index}
            data={currentData as DeploymentHistoryApplication}
            filter={filter}
            dataHead={tableHead}
            isLoading={isLoading}
            fromService
          />
        ))}
      </div>
    </Table>
  )
}

export const PageDeployments = memo(Deployments, (prevProps, nextProps) => {
  const prevDeploymentIds = prevProps.deployments?.map((deployment) => deployment.id)
  const nextDeploymentIds = nextProps.deployments?.map((deployment) => deployment.id)

  return JSON.stringify(prevDeploymentIds) === JSON.stringify(nextDeploymentIds)
})

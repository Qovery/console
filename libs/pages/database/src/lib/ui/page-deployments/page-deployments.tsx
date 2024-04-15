import { type DeploymentHistoryDatabase } from 'qovery-typescript-axios'
import { memo, useEffect, useState } from 'react'
import { Table, type TableFilterProps, TableRowDeployment } from '@qovery/shared/ui'

export interface PageDeploymentsProps {
  deployments?: DeploymentHistoryDatabase[]
  isLoading?: boolean
}

export function Deployments(props: PageDeploymentsProps) {
  const { deployments = [], isLoading = true } = props

  const [data, setData] = useState<DeploymentHistoryDatabase[]>(deployments)
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
  ]

  return (
    <>
      <Table
        dataHead={tableHead}
        data={deployments}
        setFilter={setFilter}
        filter={filter}
        setDataSort={setData}
        className="mt-2 rounded-sm"
      >
        <div>
          {data?.map((currentData, index) => (
            <TableRowDeployment
              key={index}
              data={currentData as DeploymentHistoryDatabase}
              filter={filter}
              dataHead={tableHead}
              isLoading={isLoading}
              fromService
              noCommit
            />
          ))}
        </div>
      </Table>
    </>
  )
}

export const PageDeployments = memo(Deployments, (prevProps, nextProps) => {
  const prevDeploymentIds = prevProps.deployments?.map((deployment) => deployment.id)
  const nextDeploymentIds = nextProps.deployments?.map((deployment) => deployment.id)

  return JSON.stringify(prevDeploymentIds) === JSON.stringify(nextDeploymentIds)
})

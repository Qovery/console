import { BaseLink, HelpSection, Table, TableRowDeployment } from '@console/shared/ui'
import { DeploymentHistoryDatabase } from 'qovery-typescript-axios'
import React, { useEffect, useState } from 'react'

export interface PageDeploymentsProps {
  databaseId?: string
  deployments?: DeploymentHistoryDatabase[]
  listHelpfulLinks: BaseLink[]
  isLoading?: boolean
}

export function Deployments(props: PageDeploymentsProps) {
  const { databaseId, deployments = [], listHelpfulLinks, isLoading = true } = props

  const [data, setData] = useState<DeploymentHistoryDatabase[]>(deployments)

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
        defaultData={deployments}
        filterData={data}
        setFilterData={setData}
        className="mt-2 rounded-sm"
      >
        <div>
          {data?.map((currentData, index) => (
            <TableRowDeployment
              id={databaseId}
              data={currentData as DeploymentHistoryDatabase}
              key={index}
              dataHead={tableHead}
              isLoading={isLoading}
              noCommit
            />
          ))}
        </div>
      </Table>
      <div className="rounded-b bg-white">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export const PageDeployments = React.memo(Deployments, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior
  const isEqual = JSON.stringify(prevProps.deployments?.length) === JSON.stringify(nextProps.deployments?.length)

  if (isEqual) {
    return true
  }

  return false
})

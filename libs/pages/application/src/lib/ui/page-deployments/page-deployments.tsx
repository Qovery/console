import { DeploymentHistoryApplication } from 'qovery-typescript-axios'
import React, { useEffect, useState } from 'react'
import { BaseLink, HelpSection, Table, TableFilterProps, TableRowDeployment } from '@qovery/shared/ui'

export interface PageDeploymentsProps {
  deployments?: DeploymentHistoryApplication[]
  listHelpfulLinks: BaseLink[]
  isLoading?: boolean
}

export function Deployments(props: PageDeploymentsProps) {
  const { deployments = [], listHelpfulLinks, isLoading = true } = props

  const [data, setData] = useState<DeploymentHistoryApplication[]>(deployments)
  const [filter, setFilter] = useState<TableFilterProps>({})

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
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full bg-white',
    },
  ]

  return (
    <>
      <Table
        dataHead={tableHead}
        data={deployments}
        setFilter={setFilter}
        setDataSort={setData}
        className="mt-2 rounded-sm flex-grow overflow-y-auto min-h-0"
      >
        <div>
          {data?.map((currentData, index) => (
            <TableRowDeployment
              key={index}
              data={currentData as DeploymentHistoryApplication}
              filter={filter}
              index={index}
              dataHead={tableHead}
              isLoading={isLoading}
            />
          ))}
        </div>
      </Table>
      <div className="bg-white rounded-b flex flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export const PageDeployments = React.memo(Deployments, (prevProps, nextProps) => {
  const prevDeploymentIds = prevProps.deployments?.map((deployment) => deployment.id)
  const nextDeploymentIds = nextProps.deployments?.map((deployment) => deployment.id)

  return JSON.stringify(prevDeploymentIds) === JSON.stringify(nextDeploymentIds)
})

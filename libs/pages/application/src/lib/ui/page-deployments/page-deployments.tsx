import { DeploymentHistoryApplication } from 'qovery-typescript-axios'
import React, { useEffect, useState } from 'react'
import { BaseLink, HelpSection, Table, TableRowDeployment } from '@console/shared/ui'

export interface PageDeploymentsProps {
  applicationId?: string
  deployments?: DeploymentHistoryApplication[]
  listHelpfulLinks: BaseLink[]
  isLoading?: boolean
}

export function Deployments(props: PageDeploymentsProps) {
  const { applicationId, deployments = [], listHelpfulLinks, isLoading = true } = props

  const [data, setData] = useState<DeploymentHistoryApplication[]>(deployments)

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
      title: 'Commit',
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full bg-white',
      filter: [
        {
          search: true,
          title: 'Filter by service',
          key: 'commit.git_commit_id',
        },
      ],
    },
  ]

  return (
    <>
      <Table
        dataHead={tableHead}
        defaultData={deployments}
        filterData={data}
        setFilterData={setData}
        className="mt-2 rounded-sm flex-grow overflow-y-auto min-h-0"
      >
        <div>
          {data?.map((currentData, index) => (
            <TableRowDeployment
              id={applicationId}
              data={currentData as DeploymentHistoryApplication}
              key={index}
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

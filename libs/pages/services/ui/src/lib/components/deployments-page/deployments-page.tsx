import { DeploymentService } from '@console/shared/interfaces'
import { BaseLink, HelpSection, Table, TableRowDeployment } from '@console/shared/ui'
import { useEffect, useState } from 'react'

export interface DeploymentsPageProps {
  deployments?: DeploymentService[]
  listHelpfulLinks: BaseLink[]
  isLoading?: boolean
}

export function DeploymentsPage(props: DeploymentsPageProps) {
  const { deployments = [], listHelpfulLinks, isLoading = true } = props

  const [data, setData] = useState<DeploymentService[]>(deployments)

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
          key: 'execution_id',
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
      title: 'Service',
      className: 'px-4 py-2 bg-white h-full',
      filter: [
        {
          search: true,
          title: 'Filter by service',
          key: 'name',
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
        className="mt-2 rounded-sm"
      >
        <div>
          {data?.map((currentData, index) => (
            <TableRowDeployment
              key={index}
              dataHead={tableHead}
              isLoading={isLoading}
              startGroup={currentData?.execution_id !== data[index - 1]?.execution_id && index !== 0 ? true : false}
              execution_id={currentData.execution_id || ''}
              status={currentData.status}
              service={{ id: currentData.id, type: currentData.type, name: currentData.name }}
              created_at={currentData.created_at}
              updated_at={currentData.updated_at}
              commit={currentData?.commit}
            />
          ))}
        </div>
      </Table>
      <div className="rounded-b bg-white mt-2">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export default DeploymentsPage

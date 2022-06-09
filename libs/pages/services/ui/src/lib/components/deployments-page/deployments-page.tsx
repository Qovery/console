import { DeploymentService } from '@console/shared/interfaces'
import { BaseLink, HelpSection, Table } from '@console/shared/ui'
import { useEffect, useState } from 'react'
import TableGroupDeployments from '../table-group-deployments/table-group-deployments'

export interface DeploymentsPageProps {
  deployments?: DeploymentService[]
  listHelpfulLinks: BaseLink[]
  isLoading?: boolean
}

export function DeploymentsPage(props: DeploymentsPageProps) {
  const { deployments, listHelpfulLinks, isLoading = true } = props

  const [data, setData] = useState(deployments)

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
      title: 'Service',
      className: 'px-4 py-2 bg-white h-full',
      filter: [
        {
          search: true,
          title: 'Filter by service',
          key: '',
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
        setFilterData={() => deployments && setData}
        className="mt-2 rounded-sm"
      >
        <div>
          {data?.map((currentData, index) => (
            <TableGroupDeployments data={currentData} key={index} tableHead={tableHead} isLoading={isLoading} />
          ))}
        </div>
      </Table>
      <div className="rounded-b bg-white">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export default DeploymentsPage

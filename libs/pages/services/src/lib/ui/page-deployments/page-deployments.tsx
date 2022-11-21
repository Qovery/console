import React, { useEffect, useState } from 'react'
import { DeploymentService } from '@qovery/shared/interfaces'
import { BaseLink, HelpSection, Table, TableFilterProps, TableRowDeployment } from '@qovery/shared/ui'

export interface PageDeploymentsProps {
  deployments?: DeploymentService[]
  listHelpfulLinks: BaseLink[]
  isLoading?: boolean
}

export function PageDeploymentsMemo(props: PageDeploymentsProps) {
  const { deployments = [], listHelpfulLinks, isLoading } = props

  const [data, setData] = useState<DeploymentService[]>([])
  const [filter, setFilter] = useState<TableFilterProps>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // It's a hack to render the page before the table
    // Without it the page take some time to render
    // https://blog.thoughtspile.tech/2021/11/15/unintentional-layout-effect/
    setTimeout(() => {
      deployments && setData(deployments)
      setLoading(isLoading || false)
    })
  }, [deployments, isLoading])

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
              data={currentData as DeploymentService}
              filter={filter}
              index={index}
              key={index}
              dataHead={tableHead}
              isLoading={loading}
              startGroup={currentData?.execution_id !== data[index - 1]?.execution_id && index !== 0 ? true : false}
            />
          ))}
        </div>
      </Table>
      <div className="bg-white rounded-b flex flex-col justify-end w-full">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export const PageDeployments = React.memo(PageDeploymentsMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior
  return (
    JSON.stringify(
      prevProps.deployments?.map((service) => ({
        id: service.id,
      }))
    ) ===
    JSON.stringify(
      nextProps.deployments?.map((service) => ({
        id: service.id,
      }))
    )
  )
})

export default PageDeployments

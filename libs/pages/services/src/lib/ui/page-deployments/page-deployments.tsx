import { memo, useEffect, useState } from 'react'
import { type DeploymentServiceLegacy } from '@qovery/shared/interfaces'
import { EmptyState, Table, type TableFilterProps, TableRowDeployment } from '@qovery/shared/ui'

export interface PageDeploymentsProps {
  deployments?: DeploymentServiceLegacy[]
  isLoading?: boolean
}

export function PageDeploymentsMemo(props: PageDeploymentsProps) {
  const { deployments = [], isLoading } = props

  const [data, setData] = useState<DeploymentServiceLegacy[]>([])
  const [filter, setFilter] = useState<TableFilterProps[]>([])
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
      className: 'px-4 py-2 border-b-neutral-200 border-l h-full bg-white',
    },
  ]

  if (!isLoading && deployments.length === 0)
    return (
      <div className="mt-2 h-full rounded-t-sm bg-neutral-50">
        <EmptyState
          className="m-auto mt-12 w-[420px]"
          title="No deployment yet"
          description="You need to deploy a service to see this tab."
        />
      </div>
    )

  return (
    <Table
      dataHead={tableHead}
      data={deployments}
      setFilter={setFilter}
      filter={filter}
      setDataSort={setData}
      defaultSortingKey="updated_at"
    >
      <div className="bg-neutral-200">
        {data?.map((currentData, index) => (
          <TableRowDeployment
            key={index}
            data={currentData as DeploymentServiceLegacy}
            filter={filter}
            dataHead={tableHead}
            isLoading={loading}
            startGroup={currentData?.execution_id !== data[index - 1]?.execution_id && index !== 0 ? true : false}
          />
        ))}
      </div>
    </Table>
  )
}

export const PageDeployments = memo(PageDeploymentsMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior
  return (
    JSON.stringify(
      prevProps.deployments?.map((service) => ({
        id: service.id,
        status: service.status,
      }))
    ) ===
    JSON.stringify(
      nextProps.deployments?.map((service) => ({
        id: service.id,
        status: service.status,
      }))
    )
  )
})

export default PageDeployments

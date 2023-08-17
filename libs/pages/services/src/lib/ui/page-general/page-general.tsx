import { memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useListStatuses } from '@qovery/domains/services/feature'
import { ApplicationEntity, DatabaseEntity, GitApplicationEntity } from '@qovery/shared/interfaces'
import { APPLICATION_URL, DATABASE_GENERAL_URL, DATABASE_URL, SERVICES_GENERAL_URL } from '@qovery/shared/routes'
import { BaseLink, EmptyState, HelpSection, Table, TableFilterProps } from '@qovery/shared/ui'
import TableRowServicesFeature from '../../feature/table-row-services-feature/table-row-services-feature'

export interface PageGeneralProps {
  isLoading?: boolean
  environmentMode: string
  services: (ApplicationEntity | DatabaseEntity)[]
  listHelpfulLinks: BaseLink[]
  clusterId: string
}

function PageGeneralMemo(props: PageGeneralProps) {
  const { environmentMode, services, listHelpfulLinks, isLoading, clusterId } = props
  const { organizationId, projectId, environmentId } = useParams()

  const [data, setData] = useState<(ApplicationEntity | DatabaseEntity)[]>([])
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const [loading, setLoading] = useState(isLoading)

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading])

  const { data: statuses } = useListStatuses({ environmentId })
  const servicesStatuses = [
    ...(statuses?.applications ?? []),
    ...(statuses?.containers ?? []),
    ...(statuses?.databases ?? []),
    ...(statuses?.jobs ?? []),
  ]

  const tableHead = [
    {
      title: !loading ? `${data?.length} service${data?.length && data.length > 1 ? 's' : ''}` : `0 service`,
      className: 'px-4 py-2',
      filter: [
        {
          search: true,
          title: 'Filter by status',
          key: 'status.state',
        },
      ],
    },
    {
      title: 'Update',
      className: 'px-4 text-center',
      sort: {
        key: 'updated_at',
      },
    },
    {
      title: 'Version',
      className: 'px-4 py-2 border-b-neutral-200 border-l h-full',
    },
    {
      title: 'Type',
    },
  ]

  return (
    <>
      {services.length ? (
        <Table
          dataHead={tableHead}
          data={
            services.map((service) => ({
              ...service,
              status: servicesStatuses.find((status) => status.id === service.id),
            })) as (ApplicationEntity | DatabaseEntity)[]
          }
          setFilter={setFilter}
          filter={filter}
          setDataSort={setData}
          className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
          columnsWidth="30% 20% 25% 20%"
          defaultSortingKey="name"
        >
          <>
            {data.map((currentData) => {
              const isDatabase = !(currentData as GitApplicationEntity).build_mode
              return (
                <TableRowServicesFeature
                  key={currentData.id}
                  isLoading={loading}
                  data={currentData}
                  filter={filter}
                  dataHead={tableHead}
                  link={
                    isDatabase
                      ? DATABASE_URL(organizationId, projectId, environmentId, currentData.id) + DATABASE_GENERAL_URL
                      : APPLICATION_URL(organizationId, projectId, environmentId, currentData.id) + SERVICES_GENERAL_URL
                  }
                  environmentMode={environmentMode}
                  clusterId={clusterId}
                />
              )
            })}
          </>
        </Table>
      ) : (
        !loading && (
          <EmptyState
            title="No service found"
            description="You can create a service from the button on the top"
            className="bg-white rounded-t-sm mt-2 pt-10"
            imageWidth="w-[160px]"
          />
        )
      )}

      <div className="bg-white rounded-b flex flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export const PageGeneral = memo(PageGeneralMemo)

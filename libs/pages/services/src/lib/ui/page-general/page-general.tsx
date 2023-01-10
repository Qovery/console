import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApplicationEntity, DatabaseEntity, GitApplicationEntity } from '@qovery/shared/interfaces'
import { APPLICATION_URL, DATABASE_URL, SERVICES_GENERAL_URL } from '@qovery/shared/routes'
import { BaseLink, EmptyState, HelpSection, Table, TableFilterProps } from '@qovery/shared/ui'
import TableRowServicesFeature from '../../feature/table-row-services-feature/table-row-services-feature'

export interface PageGeneralProps {
  isLoading?: boolean
  environmentMode: string
  services: (ApplicationEntity | DatabaseEntity)[]
  listHelpfulLinks: BaseLink[]
}

function PageGeneralMemo(props: PageGeneralProps) {
  const { environmentMode, services, listHelpfulLinks, isLoading } = props
  const { organizationId, projectId, environmentId } = useParams()

  const [data, setData] = useState(services)
  const [filter, setFilter] = useState<TableFilterProps>({})
  const [loading, setLoading] = useState(isLoading)

  useEffect(() => {
    setData(services)
    setLoading(isLoading)
  }, [services, isLoading])

  const tableHead = [
    {
      title: `${data.length} service${data.length > 1 ? 's' : ''}`,
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
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full',
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
          data={services}
          setFilter={setFilter}
          setDataSort={setData}
          className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
          columnsWidth="30% 20% 25% 20%"
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
                      ? DATABASE_URL(organizationId, projectId, environmentId, currentData.id) + SERVICES_GENERAL_URL
                      : APPLICATION_URL(organizationId, projectId, environmentId, currentData.id) + SERVICES_GENERAL_URL
                  }
                  environmentMode={environmentMode}
                />
              )
            })}
          </>
        </Table>
      ) : (
        !loading && (
          <EmptyState
            title="No service found"
            description="You can create an application from a git repository, from an image registry or create a database"
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

export const PageGeneral = React.memo(PageGeneralMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior
  const isEqual =
    JSON.stringify(
      prevProps.services.map((service) => ({
        status: service.status?.state,
        running_status: service.running_status?.state,
      }))
    ) ===
    JSON.stringify(
      nextProps.services.map((service) => ({
        status: service.status?.state,
        running_status: service.running_status?.state,
      }))
    )

  return isEqual
})

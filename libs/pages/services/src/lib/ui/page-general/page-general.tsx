import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { ApplicationEntity, DatabaseEntity } from '@console/shared/interfaces'
import { BaseLink, HelpSection, Table } from '@console/shared/ui'
import { APPLICATION_URL, DATABASE_URL, SERVICES_GENERAL_URL } from '@console/shared/router'
import TableRowServicesFeature from '../../feature/table-row-services-feature/table-row-services-feature'

export interface PageGeneralProps {
  environmentMode: string
  services: (ApplicationEntity | DatabaseEntity)[]
  listHelpfulLinks: BaseLink[]
}

function PageGeneralMemo(props: PageGeneralProps) {
  const { environmentMode, services, listHelpfulLinks } = props
  const { organizationId, projectId, environmentId } = useParams()

  const [data, setData] = useState(services)

  useEffect(() => {
    setData(services)
  }, [services])

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
      title: 'Commit',
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full',
    },
    {
      title: 'Type',
    },
    {
      title: 'Tags',
    },
  ]

  return (
    <>
      <Table
        dataHead={tableHead}
        defaultData={services}
        filterData={data}
        setFilterData={setData}
        className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
        columnsWidth="30% 20% 25% 10% 15%"
      >
        <>
          {data.map((currentData) => {
            const isDatabase = !(currentData as ApplicationEntity).build_mode
            return (
              <TableRowServicesFeature
                key={currentData.id}
                data={currentData}
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

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { BaseLink, HelpSection, StatusMenuActions, Table } from '@console/shared/ui'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@console/shared/router'
import { EnvironmentEntity } from '@console/shared/interfaces'
import TableRowEnvironments from '../table-row-environments/table-row-environments'
import { isDeleteAvailable } from '@console/shared/utils'

export interface PageGeneralProps {
  environments: EnvironmentEntity[]
  buttonActions: StatusMenuActions[]
  listHelpfulLinks: BaseLink[]
  removeEnvironment: (environmentId: string, name: string) => void
}

function PageGeneralMemo(props: PageGeneralProps) {
  const { environments, buttonActions, listHelpfulLinks, removeEnvironment } = props
  const { organizationId, projectId } = useParams()

  const [data, setData] = useState(environments)

  useEffect(() => {
    setData(environments)
  }, [environments])

  const tableHead = [
    {
      title: `Environment${data.length > 1 ? 's' : ''}`,
      className: 'px-4 py-2',
      filter: [
        {
          search: true,
          title: 'Filter by status',
          key: 'status.state',
        },
        {
          title: 'Filter by provider',
          key: 'cloud_provider.provider',
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
      title: 'Type',
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full',
      filter: [
        {
          search: true,
          title: 'Filter by environment type',
          key: 'mode',
        },
      ],
    },
    {
      title: 'Tags',
    },
  ]

  const columnWidth = '35% 15% 25% 25%'

  return (
    <>
      <Table
        dataHead={tableHead}
        defaultData={environments}
        filterData={data}
        setFilterData={setData}
        className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
        columnsWidth={columnWidth}
      >
        <>
          {data.map((currentData) => (
            <TableRowEnvironments
              key={currentData.id}
              data={currentData}
              dataHead={tableHead}
              link={`${SERVICES_URL(organizationId, projectId, currentData.id)}${SERVICES_GENERAL_URL}`}
              columnsWidth={columnWidth}
              buttonActions={buttonActions}
              removeEnvironment={
                currentData?.status && isDeleteAvailable(currentData?.status?.state) ? removeEnvironment : undefined
              }
            />
          ))}
        </>
      </Table>
      <div className="bg-white rounded-b flex flex-grow flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export const PageGeneral = React.memo(PageGeneralMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior
  const isEqual =
    JSON.stringify(
      prevProps.environments.map((environment) => ({
        status: environment.status?.state,
        running_status: environment.running_status?.state,
      }))
    ) ===
    JSON.stringify(
      nextProps.environments.map((environment) => ({
        status: environment.status?.state,
        running_status: environment.running_status?.state,
      }))
    )

  return isEqual
})

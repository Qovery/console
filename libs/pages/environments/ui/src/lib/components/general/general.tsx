import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { BaseLink, HelpSection, StatusMenuActions, Table } from '@console/shared/ui'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@console/shared/router'
import { EnvironmentEntity } from '@console/shared/interfaces'
import TableRowEnvironments from '../table-row-environments/table-row-environments'

export interface GeneralProps {
  environments: EnvironmentEntity[]
  buttonActions: StatusMenuActions[]
  listHelpfulLinks: BaseLink[]
}

function General(props: GeneralProps) {
  const { environments, buttonActions, listHelpfulLinks } = props
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

  return (
    <>
      <Table
        dataHead={tableHead}
        defaultData={environments}
        filterData={data}
        setFilterData={setData}
        className="mt-2 bg-white rounded-sm"
        columnsWidth="30% 20% 25% 25%"
      >
        <>
          {data.map((currentData) => (
            <TableRowEnvironments
              key={currentData.id}
              data={currentData}
              dataHead={tableHead}
              link={`${SERVICES_URL(organizationId, projectId, currentData.id)}${SERVICES_GENERAL_URL}`}
              columnsWidth="25% 25% 25% 20%"
              buttonActions={buttonActions}
            />
          ))}
        </>
      </Table>
      <div className="bg-white rounded-b">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export const GeneralPage = React.memo(General, (prevProps, nextProps) => {
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

import { useState } from 'react'
import { useParams } from 'react-router'
import { BaseLink, HelpSection, StatusMenuActions, Table } from '@console/shared/ui'
import { APPLICATIONS_GENERAL_URL, APPLICATIONS_URL } from '@console/shared/utils'
import { EnvironmentEntity } from '@console/shared/interfaces'
import TableRowEnvironments from '../table-row-environments/table-row-environments'

export interface GeneralProps {
  environments: EnvironmentEntity[]
  // @todo remove "any" after connected all status update
  buttonActions: StatusMenuActions | any
  listHelpfulLinks: BaseLink[]
}

export function GeneralPage(props: GeneralProps) {
  const { environments, buttonActions, listHelpfulLinks } = props
  const { organizationId, projectId } = useParams()

  const [data, setData] = useState(environments)

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
        columnsWidth="30% 15% 25% 30%"
      >
        <>
          {data.map((currentData) => (
            <TableRowEnvironments
              key={currentData.id}
              data={currentData}
              dataHead={tableHead}
              link={`${APPLICATIONS_URL(organizationId, projectId, currentData.id)}${APPLICATIONS_GENERAL_URL}`}
              columnsWidth="25% 20% 25% 25%"
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

export default GeneralPage

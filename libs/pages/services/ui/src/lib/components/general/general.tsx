import { ApplicationEntity } from '@console/shared/interfaces'
import { BaseLink, HelpSection, StatusMenuActions, Table } from '@console/shared/ui'
import { APPLICATION_URL, SERVICES_GENERAL_URL } from '@console/shared/utils'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import TableRowApplications from '../table-row-applications/table-row-applications'

export interface GeneralPageProps {
  environmentMode: string
  applications: ApplicationEntity[]
  buttonActions: StatusMenuActions[]
  listHelpfulLinks: BaseLink[]
}

export function GeneralPage(props: GeneralPageProps) {
  const { environmentMode, applications, buttonActions, listHelpfulLinks } = props
  const { organizationId, projectId, environmentId } = useParams()

  const [data, setData] = useState(applications)

  useEffect(() => {
    setData(applications)
  }, [applications])

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
        defaultData={applications}
        filterData={data}
        setFilterData={setData}
        className="mt-2 bg-white rounded-sm"
        columnsWidth="30% 20% 25% 10% 15%"
      >
        <>
          {data.map((currentData) => (
            <TableRowApplications
              key={currentData.id}
              data={currentData}
              dataHead={tableHead}
              link={APPLICATION_URL(organizationId, projectId, environmentId, currentData.id) + SERVICES_GENERAL_URL}
              columnsWidth="25% 25% 25% 10% 10%"
              buttonActions={buttonActions}
              environmentMode={environmentMode}
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

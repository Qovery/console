import { ApplicationEntity } from '@console/shared/interfaces'
import { Table } from '@console/shared/ui'
import { APPLICATION_URL } from '@console/shared/utils'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import TableRowApplications from '../table-row-applications/table-row-applications'

export interface GeneralPageProps {
  applications: ApplicationEntity[]
}

export function GeneralPage(props: GeneralPageProps) {
  const { applications } = props
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
    <Table
      dataHead={tableHead}
      defaultData={applications}
      filterData={data}
      setFilterData={setData}
      className="mt-2 bg-white rounded-sm"
      columnsWidth="30% 15% 25% 10% 20%"
    >
      <>
        {data.map((currentData) => (
          <TableRowApplications
            key={currentData.id}
            data={currentData}
            dataHead={tableHead}
            link={APPLICATION_URL(organizationId, projectId, environmentId, currentData.id)}
            columnsWidth="25% 20% 25% 10% 15%"
          />
        ))}
      </>
    </Table>
  )
}

export default GeneralPage

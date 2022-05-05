import { Environment } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Table } from '@console/shared/ui'
import { APPLICATIONS_URL } from '@console/shared/utils'
import TableRowEnvironments from '../table-row-environments/table-row-environments'

export interface GeneralProps {
  environments: Environment[]
}

export function GeneralPage(props: GeneralProps) {
  const { environments } = props
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
          title: 'Sort by status',
          key: 'status.state',
        },
        {
          title: 'Sort by provider',
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
      title: 'Running Schedule',
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full',
    },
    {
      title: 'Type',
      filter: [
        {
          search: true,
          title: 'Sort by environment type',
          key: 'mode',
        },
      ],
    },
    {
      title: 'Tags',
    },
  ]

  return (
    <Table
      dataHead={tableHead}
      defaultData={environments}
      setFilterData={setData}
      className="mt-2 bg-white rounded-sm"
      columnsWidth="30% 15% 25% 10% 20%"
    >
      <>
        {data.map((currentData) => (
          <TableRowEnvironments
            key={currentData.id}
            data={currentData}
            dataHead={tableHead}
            link={APPLICATIONS_URL(organizationId, projectId, currentData.id)}
            columnsWidth="25% 20% 25% 10% 15%"
          />
        ))}
      </>
    </Table>
  )
}

export default GeneralPage

import { Environment } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Icon, Modal, ModalConfirmation, Table } from '@console/shared/ui'
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
      title: 'Running Schedule',
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full',
    },
    {
      title: 'Type',
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
      <Modal
        width={488}
        trigger={
          <div className="menu-item">
            <div>
              <Icon name="icon-solid-play" className="text-sm text-brand-400 mr-3" />
              <span className="text-sm text-text-500 font-medium">{'title'}</span>
            </div>
          </div>
        }
      >
        <ModalConfirmation
          title={'title'}
          description={'description'}
          name={'name'}
          callback={() => {
            console.log('callback')
          }}
        />
      </Modal>
      <Table
        dataHead={tableHead}
        defaultData={environments}
        filterData={data}
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
    </>
  )
}

export default GeneralPage

import { Meta, Story } from '@storybook/react'
import { environmentFactoryMock } from '@console/domains/environment'
import { Table, TableProps } from './table'
import { TableRow } from './table-row/table-row'
import { useState } from 'react'

export default {
  component: Table,
  title: 'Table',
} as Meta

const environmentData = environmentFactoryMock(4)

const Template: Story<TableProps> = (args) => {
  const [data, setData] = useState(environmentData)

  return (
    <Table {...args} defaultData={environmentData} setFilterData={setData}>
      <>
        {data.map((currentData, index) => (
          <TableRow key={index} columnsWidth={args.columnsWidth} link="/">
            <>
              <div className="px-2 text-sm text-text-500">
                {currentData.name} - {currentData.status?.state}
              </div>
              <div className="px-2 text-xs text-text-500 truncate">{currentData.created_at}</div>
              <div className="px-2 text-sm text-text-500">{currentData.mode}</div>
            </>
          </TableRow>
        ))}
      </>
    </Table>
  )
}

const dataHead = [
  {
    title: 'Status',
    className: 'px-4 py-2',
    filter: [
      {
        search: true,
        title: 'Sort by status',
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
    title: 'Type',
    filter: [
      {
        search: true,
        title: 'Sort by environment type',
        key: 'mode',
      },
    ],
  },
]

export const Primary = Template.bind({})
Primary.args = {
  dataHead: dataHead,
  className: 'bg-white rounded-sm',
  columnsWidth: '33% 33% 33%',
}

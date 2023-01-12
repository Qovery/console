import { Meta, Story } from '@storybook/react'
import { useState } from 'react'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import Button from '../buttons/button/button'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { Table, TableFilterProps, TableProps } from './table'
import { TableRow } from './table-row/table-row'

export default {
  component: Table,
  title: 'Table',
} as Meta

const environmentData = environmentFactoryMock(20)

const addRow = (data: EnvironmentEntity[]): EnvironmentEntity[] => {
  const newData = [...data]
  newData.push(environmentFactoryMock(1)[0])
  return newData
}

const Template: Story<TableProps> = (args) => {
  const [data, setData] = useState<EnvironmentEntity[]>(environmentData)
  const [filter, setFilter] = useState<TableFilterProps>({})

  return (
    <>
      <Button className="mb-4" onClick={() => setData(addRow(data))}>
        Add Row
      </Button>
      <Table {...args} data={data} setFilter={setFilter} setDataSort={setData}>
        <>
          {data.map((currentData, index) => (
            <TableRow key={index} columnsWidth={args.columnsWidth} data={currentData} filter={filter} link="/">
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
    </>
  )
}

const dataHead = [
  {
    title: 'Status',
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
    title: 'Type',
    filter: [
      {
        search: true,
        title: 'Filter by environment type',
        key: 'mode',
        itemContentCustom: (data: any, currentFilter: string) => {
          const isActive = currentFilter === data.mode
          return (
            <p>
              {isActive ? <Icon name={IconAwesomeEnum.CHECK} /> : ''}
              {data.status.state} {data.mode}
            </p>
          )
        },
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

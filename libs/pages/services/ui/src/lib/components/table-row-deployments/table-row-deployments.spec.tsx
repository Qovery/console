import { render } from '__tests__/utils/setup-jest'
import { Chance } from 'chance'
import { StateEnum } from 'qovery-typescript-axios'

import { TableRowDeployments, TableRowDeploymentsProps } from './table-row-deployments'
const chance = new Chance()

let props: TableRowDeploymentsProps

beforeEach(() => {
  props = {
    data: {
      id: chance.integer().toString(),
      execution_id: chance.integer().toString(),
      created_at: chance.date().toString(),
      updated_at: chance.date().toString(),
      name: chance.name(),
      status: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.RUNNING, StateEnum.STOP_ERROR])),
    },
    dataHead: [
      {
        title: 'Execution ID',
        className: 'px-4 py-2 bg-white h-full',
        filter: [
          {
            search: true,
            title: 'Filter by id',
            key: 'execution_id',
          },
        ],
      },
      {
        title: 'Status',
        className: 'px-4 py-2 bg-white h-full',
        filter: [
          {
            search: true,
            title: 'Filter by status',
            key: 'status',
          },
        ],
      },
      {
        title: 'Service',
        className: 'px-4 py-2 bg-white h-full',
        filter: [
          {
            search: true,
            title: 'Filter by service',
            key: 'name',
          },
        ],
      },
      {
        title: 'Update',
        className: 'px-4 py-2 bg-white h-full flex items-center',
        sort: {
          key: 'updated_at',
        },
      },
      {
        title: 'Commit',
        className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full bg-white',
        filter: [
          {
            search: true,
            title: 'Filter by service',
            key: 'commit.git_commit_id',
          },
        ],
      },
    ],
    link: '',
  }
})

describe('TableRowDeployments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowDeployments {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

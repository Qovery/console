import { render } from '__tests__/utils/setup-jest'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { applicationDeploymentsFactoryMock } from '@qovery/shared/factories'
import TableRowDeployment, { TableRowDeploymentProps } from './table-row-deployment'

let props: TableRowDeploymentProps

beforeEach(() => {
  props = {
    data: applicationDeploymentsFactoryMock(1)[0],
    dataHead: [
      {
        title: 'Execution ID',
        className: 'px-4 py-2 bg-white h-full',
        filter: [
          {
            search: true,
            title: 'Filter by id',
            key: 'id',
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
        title: 'Update',
        className: 'px-4 py-2 bg-white h-full flex items-center',
        sort: {
          key: 'updated_at',
        },
      },
      {
        title: 'Version',
        className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full bg-white',
      },
    ],
  }
})

describe('TableRowDeployment', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowDeployment {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

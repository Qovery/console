import { render, screen } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum, StateEnum } from 'qovery-typescript-axios'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { applicationDeploymentsFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import TableRowDeployment, { type TableRowDeploymentProps } from './table-row-deployment'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0', projectId: '1', environmentId: '2', applicationId: '3', databaseId: '4' }),
}))

describe('TableRowDeployment', () => {
  const props: TableRowDeploymentProps = {
    data: applicationDeploymentsFactoryMock(1)[0],
    isLoading: false,
    filter: [],
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
        className: 'px-4 py-2 border-b-neutral-200 border-l h-full bg-white',
      },
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<TableRowDeployment {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have link to pod logs', async () => {
    props.fromService = true
    renderWithProviders(<TableRowDeployment {...props} />)

    const btnLogs = screen.getByTestId('btn-logs')
    expect(btnLogs).toHaveAttribute('href', '/organization/0/project/1/environment/2/logs/3/deployment-logs/0')
  })

  it('should have link to deployment logs with version', async () => {
    props.fromService = false
    props.data = {
      id: '5',
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      name: 'my-app',
      status: StateEnum.BUILDING,
      type: ServiceTypeEnum.APPLICATION,
      execution_id: 'execution-id',
    }

    renderWithProviders(<TableRowDeployment {...props} />)

    const btnLogs = screen.getByTestId('btn-logs')
    expect(btnLogs).toHaveAttribute(
      'href',
      '/organization/0/project/1/environment/2/logs/3/deployment-logs/execution-id'
    )
  })
})

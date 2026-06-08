import { EnvironmentModeEnum, type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentsTableActionBar } from './environments-table-action-bar'

const mockStopEnvironment = jest.fn()

jest.mock('../hooks/use-stop-environment/use-stop-environment', () => ({
  useStopEnvironment: () => ({
    mutateAsync: mockStopEnvironment,
  }),
}))

const rows: EnvironmentOverviewResponse[] = [
  {
    id: 'env-1',
    name: 'Stoppable environment',
    mode: EnvironmentModeEnum.DEVELOPMENT,
    services_overview: {
      service_count: 2,
      managed_by: 'QOVERY',
    },
    deployment_status: {
      last_deployment_state: 'DEPLOYED',
    },
  },
  {
    id: 'env-2',
    name: 'Stopped environment',
    mode: EnvironmentModeEnum.DEVELOPMENT,
    services_overview: {
      service_count: 2,
      managed_by: 'QOVERY',
    },
    deployment_status: {
      last_deployment_state: 'STOPPED',
    },
  },
] as EnvironmentOverviewResponse[]

describe('EnvironmentsTableActionBar', () => {
  beforeEach(() => {
    mockStopEnvironment.mockReset()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <EnvironmentsTableActionBar projectId="project-1" selectedRows={[]} resetRowSelection={jest.fn()} />
    )
    expect(baseElement).toBeTruthy()
  })

  it('should show selected environment count', () => {
    renderWithProviders(
      <EnvironmentsTableActionBar projectId="project-1" selectedRows={rows} resetRowSelection={jest.fn()} />
    )

    expect(screen.getByText('2 selected environments')).toBeInTheDocument()
  })
})

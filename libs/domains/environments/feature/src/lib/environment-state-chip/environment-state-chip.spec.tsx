import { StateEnum } from 'qovery-typescript-axios'
import { RunningState } from '@qovery/shared/enums'
import { renderWithProviders } from '@qovery/shared/util-tests'
import EnvironmentStateChip from './environment-state-chip'

jest.mock('../hooks/use-deployment-status/use-deployment-status', () => {
  return {
    ...jest.requireActual('../hooks/use-deployment-status/use-deployment-status'),
    useDeploymentStatus: () => ({
      data: {
        state: StateEnum.BUILDING,
        last_deployment_date: '2023-08-11T13:33:32.083371Z',
      },
    }),
  }
})

jest.mock('../hooks/use-running-status/use-running-status', () => {
  return {
    ...jest.requireActual('../hooks/use-running-status/use-running-status'),
    useRunningStatus: () => ({
      data: {
        state: RunningState.STARTING,
        last_running_date: '2023-08-11T13:33:32.083371Z',
      },
    }),
  }
})

describe('EnvironmentStatusChip', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<EnvironmentStateChip mode="deployment" />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot with deployment status', () => {
    const { container } = renderWithProviders(<EnvironmentStateChip mode="deployment" environmentId="123" />)
    expect(container).toMatchSnapshot()
  })
  it('should match snapshot with running status', () => {
    const { container } = renderWithProviders(<EnvironmentStateChip mode="running" environmentId="123" />)
    expect(container).toMatchSnapshot()
  })
})

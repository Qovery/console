import { renderWithProviders } from '@qovery/shared/util-tests'
import ServiceStateChip from './service-state-chip'

jest.mock('../hooks/use-deployment-status/use-deployment-status', () => {
  return {
    ...jest.requireActual('../hooks/use-deployment-status/use-deployment-status'),
    useDeploymentStatus: () => ({
      data: {
        state: 'BUILDING',
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
        state: 'STARTING',
      },
    }),
  }
})

describe('ServiceStateChip', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ServiceStateChip mode="deployment" />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot with deployment status', () => {
    const { container } = renderWithProviders(
      <ServiceStateChip mode="deployment" environmentId="123" serviceId="321" />
    )
    expect(container).toMatchSnapshot()
  })
  it('should match snapshot with running status', () => {
    const { container } = renderWithProviders(<ServiceStateChip mode="running" environmentId="123" serviceId="321" />)
    expect(container).toMatchSnapshot()
  })
})

import { renderWithProviders } from '@qovery/shared/util-tests'
import ServiceDeploymentStatusLabel from './service-deployment-status-label'

jest.mock('../hooks/use-deployment-status/use-deployment-status', () => {
  return {
    ...jest.requireActual('../hooks/use-deployment-status/use-deployment-status'),
    useDeploymentStatus: () => ({
      data: {
        state: 'BUILDING',
        last_deployment_date: '',
      },
    }),
  }
})

describe('ServiceDeploymentStatusLabel', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ServiceDeploymentStatusLabel />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot', () => {
    const { container } = renderWithProviders(<ServiceDeploymentStatusLabel environmentId="123" serviceId="321" />)
    expect(container).toMatchSnapshot()
  })
})

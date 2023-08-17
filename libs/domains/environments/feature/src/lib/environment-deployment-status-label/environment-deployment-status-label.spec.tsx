import { renderWithProviders } from '@qovery/shared/util-tests'
import EnvironmentDeploymentStatusLabel from './environment-deployment-status-label'

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

describe('EnvironmentDeploymentStatusLabel', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<EnvironmentDeploymentStatusLabel />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot', () => {
    const { container } = renderWithProviders(<EnvironmentDeploymentStatusLabel environmentId="123" />)
    expect(container).toMatchSnapshot()
  })
})

import { environmentFactoryMock } from '@qovery/shared/factories'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentActionToolbar } from './environment-action-toolbar'

const mockEnvironment = environmentFactoryMock(1)[0]
const mockServices = applicationFactoryMock(3)

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('../hooks/use-deployment-status/use-deployment-status', () => {
  return {
    ...jest.requireActual('../hooks/use-deployment-status/use-deployment-status'),
    useDeploymentStatus: () => ({
      data: {
        state: 'DEPLOYED',
      },
    }),
  }
})

jest.mock('../hooks/use-service-count/use-service-count', () => ({
  useServiceCount: () => ({
    data: mockServices,
    isFetched: true,
  }),
}))

describe('EnvironmentActionToolbar', () => {
  it('should match manage deployment snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })
    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match other actions snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} />, {
      container: document.body,
    })
    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(baseElement).toMatchSnapshot()
  })

  it('should have variant with only deployment actions', () => {
    renderWithProviders(<EnvironmentActionToolbar environment={mockEnvironment} variant="deployment" />, {
      container: document.body,
    })

    expect(screen.getByLabelText(/manage deployment/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/other actions/i)).not.toBeInTheDocument()
  })
})

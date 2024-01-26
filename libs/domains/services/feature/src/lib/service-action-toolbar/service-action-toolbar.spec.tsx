import { environmentFactoryMock, helmFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceActionToolbar } from './service-action-toolbar'

const mockHelm = helmFactoryMock(1)[0]
const mockEnvironment = environmentFactoryMock(1)[0]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '123', projectId: '456', environmentId: '789' }),
  useNavigate: () => jest.fn(),
}))

jest.mock('../hooks/use-service/use-service', () => ({
  useService: () => ({
    data: mockHelm,
  }),
}))

jest.mock('../hooks/use-deployment-status/use-deployment-status', () => {
  return {
    ...jest.requireActual('../hooks/use-deployment-status/use-deployment-status'),
    useDeploymentStatus: () => ({
      data: {
        state: 'READY',
      },
    }),
  }
})

describe('ServiceActionToolbar', () => {
  it('should match manage deployment snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <ServiceActionToolbar serviceId={mockHelm.id} environment={mockEnvironment} />,
      {
        container: document.body,
      }
    )
    const buttonManageDeployment = screen.getByLabelText(/manage deployment/i)
    await userEvent.click(buttonManageDeployment)

    expect(baseElement).toMatchSnapshot()
  })

  it('should match other actions snapshot', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <ServiceActionToolbar serviceId={mockHelm.id} environment={mockEnvironment} />,
      {
        container: document.body,
      }
    )
    const buttonOtherActions = screen.getByLabelText(/other actions/i)
    await userEvent.click(buttonOtherActions)

    expect(baseElement).toMatchSnapshot()
  })
})

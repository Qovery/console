import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { DeployWithVersionModal } from './deploy-with-version-modal'

const mockCloseModal = jest.fn()
const mockDeployAllServices = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    closeModal: mockCloseModal,
  }),
}))

jest.mock('../hooks/use-deploy-all-services/use-deploy-all-services', () => ({
  useDeployAllServices: () => ({
    mutate: mockDeployAllServices,
    isLoading: false,
  }),
}))

jest.mock('../hooks/use-services-for-deploy/use-services-for-deploy', () => ({
  useServicesForDeploy: () => ({
    data: [],
    isLoading: false,
  }),
}))

describe('DeployWithVersionModal', () => {
  const environment = environmentFactoryMock(1)[0]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render empty state when no services', () => {
    renderWithProviders(<DeployWithVersionModal environment={environment} />)

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('should disable deploy button when no services selected', () => {
    renderWithProviders(<DeployWithVersionModal environment={environment} />)

    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('should call closeModal when cancel is clicked', async () => {
    const { userEvent } = renderWithProviders(<DeployWithVersionModal environment={environment} />)

    await userEvent.click(screen.getByTestId('cancel-button'))
    expect(mockCloseModal).toHaveBeenCalled()
  })
})

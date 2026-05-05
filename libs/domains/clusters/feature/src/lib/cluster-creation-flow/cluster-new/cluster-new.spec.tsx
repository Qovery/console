import posthog from 'posthog-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterNew } from './cluster-new'

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => false),
}))

const mockShowPylonForm = jest.fn()
const mockUseClusterCreationRestriction = jest.fn(() => ({
  isClusterCreationRestricted: false,
  isNoCreditCardRestriction: false,
}))

jest.mock('../../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction', () => ({
  useClusterCreationRestriction: (params: { organizationId: string }) => mockUseClusterCreationRestriction(params),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  useDocumentTitle: jest.fn(),
  useSupportChat: () => ({
    showPylonForm: mockShowPylonForm,
  }),
  useClickAway: () => ({ current: null }),
}))

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}))

const mockUseParams = jest.fn((_options?: { strict?: boolean }) => ({ organizationId: 'test-org-id' }))

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: (options?: { strict?: boolean }) => mockUseParams(options),
    Link: React.forwardRef(
      (
        { children, ...props }: { children?: React.ReactNode; [key: string]: unknown },
        ref: React.Ref<HTMLAnchorElement>
      ) => React.createElement('a', { ref, ...props }, children)
    ),
  }
})

const getProviderCard = (title: string) => screen.getByText(title).closest('button')

const getExpandedSelfManagedButton = () =>
  screen
    .getAllByText('Self-managed')
    .map((element) => element.closest('button'))
    .find((button) => button?.textContent?.includes('Advanced Kubernetes knowledge required.'))

describe('ClusterNew', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ organizationId: 'test-org-id' })
    mockUseClusterCreationRestriction.mockReturnValue({
      isClusterCreationRestricted: false,
      isNoCreditCardRestriction: false,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterNew />)
    expect(baseElement).toBeTruthy()
  })

  it('should render local machine demo option', () => {
    renderWithProviders(<ClusterNew />)
    expect(screen.getByText('Local machine (demo)')).toBeInTheDocument()
  })

  it('should render cloud provider cards', () => {
    renderWithProviders(<ClusterNew />)
    expect(screen.getByText('Amazon Web Services')).toBeInTheDocument()
    expect(screen.getByText('Google Cloud Platform')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Azure')).toBeInTheDocument()
  })

  it('should expand AWS card and show options when clicked', async () => {
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const awsCard = getProviderCard('Amazon Web Services')
    expect(awsCard).toBeInTheDocument()

    await userEvent.click(awsCard as Element)

    expect(screen.getByText('Qovery Managed')).toBeInTheDocument()
    expect(getExpandedSelfManagedButton()).toBeInTheDocument()
  })

  it('should render Azure managed option with recommended badge', async () => {
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const azureCard = getProviderCard('Microsoft Azure')
    expect(azureCard).toBeInTheDocument()

    await userEvent.click(azureCard as Element)

    expect(screen.getByText('Qovery Managed')).toBeInTheDocument()
    expect(screen.getAllByText('recommended').length).toBeGreaterThan(0)
  })

  it('should open installation guide modal when clicking self-managed option', async () => {
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const awsCard = getProviderCard('Amazon Web Services')
    expect(awsCard).toBeInTheDocument()

    await userEvent.click(awsCard as Element)

    const selfManagedButton = getExpandedSelfManagedButton()
    expect(selfManagedButton).toBeInTheDocument()

    await userEvent.click(selfManagedButton as Element)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({ isDemo: false, type: 'ON_PREMISE' }),
        }),
      })
    )
    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: 'AWS',
      selectedInstallationType: 'self-managed',
    })
  })

  it('should open demo modal when clicking local machine option', async () => {
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const demoButton = screen.getByText('Local machine (demo)').closest('button')
    expect(demoButton).toBeInTheDocument()

    await userEvent.click(demoButton as Element)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({ isDemo: true, type: 'ON_PREMISE' }),
        }),
      })
    )
    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: 'OTHER',
      selectedInstallationType: 'demo',
    })
  })

  it('should show the free-trial callout and keep providers expandable when credit card is missing', async () => {
    mockUseClusterCreationRestriction.mockReturnValue({
      isClusterCreationRestricted: true,
      isNoCreditCardRestriction: true,
    })
    const { userEvent } = renderWithProviders(<ClusterNew />)

    expect(screen.getByText('Add a credit card to create a cluster')).toBeInTheDocument()

    const awsCard = getProviderCard('Amazon Web Services')
    expect(awsCard).toBeInTheDocument()

    await userEvent.click(awsCard as Element)

    expect(screen.getByText('Qovery Managed')).toBeInTheDocument()
  })

  it('should open the add credit card modal when clicking a restricted cloud option', async () => {
    mockUseClusterCreationRestriction.mockReturnValue({
      isClusterCreationRestricted: true,
      isNoCreditCardRestriction: true,
    })
    const { userEvent } = renderWithProviders(<ClusterNew />)

    await userEvent.click(getProviderCard('Amazon Web Services') as Element)

    const managedButton = screen.getByText('Qovery Managed').closest('button')
    expect(managedButton).toBeInTheDocument()

    await userEvent.click(managedButton as Element)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({ organizationId: 'test-org-id' }),
        }),
      })
    )
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('should open the add credit card modal when clicking a restricted self-managed standalone card', async () => {
    mockUseClusterCreationRestriction.mockReturnValue({
      isClusterCreationRestricted: true,
      isNoCreditCardRestriction: true,
    })
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const ovhCard = getProviderCard('OVH Cloud')
    expect(ovhCard).toBeInTheDocument()

    await userEvent.click(ovhCard as Element)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({ organizationId: 'test-org-id' }),
        }),
      })
    )
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('should keep the demo card active during free trial restriction', async () => {
    mockUseClusterCreationRestriction.mockReturnValue({
      isClusterCreationRestricted: true,
      isNoCreditCardRestriction: true,
    })
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const demoButton = screen.getByText('Local machine (demo)').closest('button')
    expect(demoButton).toBeInTheDocument()

    await userEvent.click(demoButton as Element)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({ isDemo: true, type: 'ON_PREMISE' }),
        }),
      })
    )
  })

  it('should show the billing restriction callout and keep restricted cards inactive without modal', async () => {
    mockUseClusterCreationRestriction.mockReturnValue({
      isClusterCreationRestricted: true,
      isNoCreditCardRestriction: false,
    })
    const { userEvent } = renderWithProviders(<ClusterNew />)

    expect(screen.getByText('Cluster creation is restricted')).toBeInTheDocument()

    await userEvent.click(getProviderCard('Amazon Web Services') as Element)

    const managedButton = screen.getByText('Qovery Managed').closest('button')
    expect(managedButton).toBeInTheDocument()

    await userEvent.click(managedButton as Element)

    expect(mockOpenModal).not.toHaveBeenCalled()
    expect(posthog.capture).not.toHaveBeenCalled()
  })
})

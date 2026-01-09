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

describe('ClusterNew', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ organizationId: 'test-org-id' })
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

    const awsCard = screen.getByText('Amazon Web Services').closest('div')?.parentElement
    expect(awsCard).toBeInstanceOf(Element)

    await userEvent.click(awsCard as Element)

    expect(screen.getByText('Qovery Managed')).toBeInTheDocument()
    const selfManagedOptions = screen.getAllByText('Self-managed')
    expect(selfManagedOptions.length).toBeGreaterThan(0)
  })

  it('should render managed cluster option', async () => {
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const awsCard = screen.getByText('Amazon Web Services').closest('div')?.parentElement
    expect(awsCard).toBeInstanceOf(Element)

    await userEvent.click(awsCard as Element)

    const qoveryManagedOptions = screen.getAllByText('Qovery Managed')
    expect(qoveryManagedOptions.length).toBeGreaterThan(0)
  })

  it('should render Azure managed option with recommended badge', async () => {
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const azureCard = screen.getByText('Microsoft Azure').closest('div')?.parentElement
    expect(azureCard).toBeInstanceOf(Element)

    await userEvent.click(azureCard as Element)

    expect(screen.getByText('Qovery Managed')).toBeInTheDocument()
    const recommendedBadges = screen.getAllByText('recommended')
    expect(recommendedBadges.length).toBeGreaterThan(0)
  })

  it('should open installation guide modal when clicking self-managed option', async () => {
    const { userEvent } = renderWithProviders(<ClusterNew />)

    const awsCard = screen.getByText('Amazon Web Services').closest('div')?.parentElement
    expect(awsCard).toBeInstanceOf(Element)

    await userEvent.click(awsCard as Element)

    const selfManagedOptions = screen.getAllByText('Self-managed')
    const selfManagedButton = selfManagedOptions.find((el) => el.closest('button'))?.closest('button')
    expect(selfManagedButton).toBeInTheDocument()

    await userEvent.click(selfManagedButton as Element)

    expect(mockOpenModal).toHaveBeenCalled()
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

    expect(mockOpenModal).toHaveBeenCalled()
    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: 'OTHER',
      selectedInstallationType: 'demo',
    })
  })
})

import posthog from 'posthog-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageNewFeature } from './page-new-feature'

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

describe('PageNewFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageNewFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should render Microsoft Azure cluster option', () => {
    renderWithProviders(<PageNewFeature />)

    expect(screen.getByText('Microsoft Azure')).toBeInTheDocument()
  })

  it('should render Azure with recommended badge when expanded', async () => {
    const { userEvent } = renderWithProviders(<PageNewFeature />)

    const azureCard = screen.getByText('Microsoft Azure').closest('div')?.parentElement
    expect(azureCard).toBeInstanceOf(Element)

    await userEvent.click(azureCard as Element)

    const recommendedBadges = screen.getAllByText('recommended')
    expect(recommendedBadges.length).toBeGreaterThan(0)
  })

  it('should render Azure Qovery Managed option with recommended badge', async () => {
    const { userEvent } = renderWithProviders(<PageNewFeature />)

    const azureCard = screen.getByText('Microsoft Azure').closest('div')?.parentElement
    expect(azureCard).toBeInstanceOf(Element)

    await userEvent.click(azureCard as Element)

    expect(screen.getByText('Qovery Managed')).toBeInTheDocument()

    const recommendedBadges = screen.getAllByText('recommended')
    expect(recommendedBadges.length).toBeGreaterThan(0)
  })

  it('should render managed cluster option as NavLink', async () => {
    const { userEvent } = renderWithProviders(<PageNewFeature />)

    const awsCard = screen.getByText('Amazon Web Services').closest('div')?.parentElement
    expect(awsCard).toBeInstanceOf(Element)

    await userEvent.click(awsCard as Element)

    const qoveryManagedOption = screen.getAllByText('Qovery Managed')[0]
    expect(qoveryManagedOption).toBeInTheDocument()
  })

  it('should call analytics when clicking on managed cluster option', async () => {
    const { userEvent } = renderWithProviders(<PageNewFeature />)

    const awsCard = screen.getByText('Amazon Web Services').closest('div')?.parentElement
    expect(awsCard).toBeInstanceOf(Element)

    await userEvent.click(awsCard as Element)

    const qoveryManagedOptions = screen.getAllByText('Qovery Managed')
    const qoveryManagedLink = qoveryManagedOptions[0].closest('a')
    expect(qoveryManagedLink).toBeInTheDocument()

    await userEvent.click(qoveryManagedLink as Element)

    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: 'AWS',
      selectedInstallationType: 'managed',
    })
  })

  it('should render Azure managed cluster option as clickable NavLink', async () => {
    const { userEvent } = renderWithProviders(<PageNewFeature />)

    const azureCard = screen.getByText('Microsoft Azure').closest('div')?.parentElement
    expect(azureCard).toBeInstanceOf(Element)

    await userEvent.click(azureCard as Element)

    const qoveryManagedOptions = screen.getAllByText('Qovery Managed')
    expect(qoveryManagedOptions.length).toBeGreaterThan(0)

    const azureQoveryManagedLink = qoveryManagedOptions[0].closest('a')
    expect(azureQoveryManagedLink).toBeInTheDocument()

    await userEvent.click(azureQoveryManagedLink as Element)

    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: 'AZURE',
      selectedInstallationType: 'managed',
    })
  })
})

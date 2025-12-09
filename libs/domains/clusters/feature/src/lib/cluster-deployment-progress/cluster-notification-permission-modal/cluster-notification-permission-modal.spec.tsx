import { useNotificationPreferences } from '@qovery/shared/util-hooks'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterNotificationPermissionModal, {
  type ClusterNotificationPermissionModalProps,
} from './cluster-notification-permission-modal'

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useNotificationPreferences: jest.fn(),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockUseNotificationPreferences = useNotificationPreferences as jest.MockedFunction<
  typeof useNotificationPreferences
>

describe('ClusterNotificationPermissionModal', () => {
  const props: ClusterNotificationPermissionModalProps = {
    organizationId: 'org-1',
    onClose: jest.fn(),
    onComplete: jest.fn(),
  }

  beforeEach(() => {
    mockUseNotificationPreferences.mockReturnValue({
      notificationsEnabled: false,
      setNotificationsEnabled: jest.fn(),
      soundEnabled: false,
      setSoundEnabled: jest.fn(),
      requestPermission: jest.fn().mockResolvedValue(undefined),
      isNotificationEnabled: jest.fn().mockReturnValue(false),
      isSoundEnabled: jest.fn().mockReturnValue(false),
      isBrowserNotificationSupported: true,
      soundEnabledKey: 'cluster-sound-enabled',
      notificationEnabledKey: 'cluster-notification-enabled',
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterNotificationPermissionModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the modal title and description', () => {
    renderWithProviders(<ClusterNotificationPermissionModal {...props} />)

    expect(screen.getByText('Get notified at completion')).toBeInTheDocument()
    expect(screen.getByText('Choose how you want to be alerted when the installation completes.')).toBeInTheDocument()
  })

  it('should render notification and sound toggles', () => {
    renderWithProviders(<ClusterNotificationPermissionModal {...props} />)

    expect(screen.getByText('Browser notifications')).toBeInTheDocument()
    expect(screen.getByText('Sound alert')).toBeInTheDocument()
  })

  it('should call onClose when Not now button is clicked', async () => {
    const { userEvent } = renderWithProviders(<ClusterNotificationPermissionModal {...props} />)

    const notNowButton = screen.getByText('Not now')
    await userEvent.click(notNowButton)

    expect(props.onClose).toHaveBeenCalled()
  })

  it('should call onClose and onComplete when Confirm button is clicked', async () => {
    const mockOnComplete = jest.fn().mockResolvedValue(undefined)
    const { userEvent } = renderWithProviders(
      <ClusterNotificationPermissionModal {...props} onComplete={mockOnComplete} />
    )

    const confirmButton = screen.getByText('Confirm')
    await userEvent.click(confirmButton)

    expect(props.onClose).toHaveBeenCalled()
    expect(mockOnComplete).toHaveBeenCalled()
  })
})

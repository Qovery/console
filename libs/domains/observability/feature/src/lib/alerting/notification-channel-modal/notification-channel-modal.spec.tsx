import { type AlertReceiverResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCreateAlertReceiver from '../../hooks/use-create-alert-receiver/use-create-alert-receiver'
import * as useEditAlertReceiver from '../../hooks/use-edit-alert-receiver/use-edit-alert-receiver'
import { NotificationChannelModal } from './notification-channel-modal'

const mockUseCreateAlertReceiver = jest.spyOn(useCreateAlertReceiver, 'useCreateAlertReceiver') as jest.Mock
const mockUseEditAlertReceiver = jest.spyOn(useEditAlertReceiver, 'useEditAlertReceiver') as jest.Mock

const mockOnClose = jest.fn()

describe('NotificationChannelModal', () => {
  const defaultAlertReceiver: AlertReceiverResponse = {
    id: 'receiver-123',
    name: 'My Channel',
    type: 'SLACK',
    send_resolved: true,
  } as AlertReceiverResponse

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCreateAlertReceiver.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    })
    mockUseEditAlertReceiver.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    })
  })

  it('should render create mode with correct title and submit label', async () => {
    renderWithProviders(<NotificationChannelModal onClose={mockOnClose} organizationId="org-123" type="SLACK" />)

    expect(await screen.findByText('New channel')).toBeInTheDocument()
    expect(await screen.findByText('Confirm creation')).toBeInTheDocument()
  })

  it('should render edit mode with correct title and submit label', async () => {
    renderWithProviders(
      <NotificationChannelModal onClose={mockOnClose} organizationId="org-123" alertReceiver={defaultAlertReceiver} />
    )

    expect(await screen.findByText('Edit channel')).toBeInTheDocument()
    expect(await screen.findByText('Save')).toBeInTheDocument()
  })

  it('should render form fields', async () => {
    renderWithProviders(<NotificationChannelModal onClose={mockOnClose} organizationId="org-123" type="SLACK" />)

    expect(await screen.findByLabelText('Display name')).toBeInTheDocument()
    expect(await screen.findByLabelText('Webhook URL')).toBeInTheDocument()
  })

  it('should pre-fill values when editing', async () => {
    renderWithProviders(
      <NotificationChannelModal onClose={mockOnClose} organizationId="org-123" alertReceiver={defaultAlertReceiver} />
    )

    expect(await screen.findByDisplayValue('My Channel')).toBeInTheDocument()
  })
})

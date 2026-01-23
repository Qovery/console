import { type AlertReceiverResponse, type EmailAlertReceiverResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCreateAlertReceiver from '../../hooks/use-create-alert-receiver/use-create-alert-receiver'
import * as useEditAlertReceiver from '../../hooks/use-edit-alert-receiver/use-edit-alert-receiver'
import * as useValidateAlertReceiver from '../../hooks/use-validate-alert-receiver/use-validate-alert-receiver'
import { NotificationChannelModal } from './notification-channel-modal'

const mockUseCreateAlertReceiver = jest.spyOn(useCreateAlertReceiver, 'useCreateAlertReceiver') as jest.Mock
const mockUseEditAlertReceiver = jest.spyOn(useEditAlertReceiver, 'useEditAlertReceiver') as jest.Mock
const mockUseValidateAlertReceiver = jest.spyOn(useValidateAlertReceiver, 'useValidateAlertReceiver') as jest.Mock

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
    mockUseValidateAlertReceiver.mockReturnValue({
      mutate: jest.fn(),
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

  it('should send test notification request when button is clicked in create mode', async () => {
    const mockValidateAlertReceiver = jest.fn()
    mockUseValidateAlertReceiver.mockReturnValue({
      mutate: mockValidateAlertReceiver,
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(
      <NotificationChannelModal onClose={mockOnClose} organizationId="org-123" type="SLACK" />
    )

    const testButton = await screen.findByText('Send test notification')
    expect(testButton).toBeInTheDocument()

    await userEvent.click(testButton)

    expect(mockValidateAlertReceiver).toHaveBeenCalledWith({
      payload: {
        alert_receiver: {
          name: 'Input slack channel',
          type: 'SLACK',
          send_resolved: true,
          organization_id: 'org-123',
          description: 'Webhook for Qovery alerts',
          webhook_url: '',
        },
      },
    })
  })

  it('should send test notification request when button is clicked in edit mode', async () => {
    const mockValidateAlertReceiver = jest.fn()
    mockUseValidateAlertReceiver.mockReturnValue({
      mutate: mockValidateAlertReceiver,
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(
      <NotificationChannelModal onClose={mockOnClose} organizationId="org-123" alertReceiver={defaultAlertReceiver} />
    )

    const testButton = await screen.findByText('Send test notification')
    expect(testButton).toBeInTheDocument()

    await userEvent.click(testButton)

    expect(mockValidateAlertReceiver).toHaveBeenCalledWith({
      alertReceiverId: 'receiver-123',
      payload: {},
    })
  })

  describe('EMAIL receiver type', () => {
    const emailAlertReceiver: EmailAlertReceiverResponse = {
      id: 'email-receiver-123',
      name: 'Email Notifications',
      type: 'EMAIL',
      send_resolved: true,
      to: 'ops@example.com',
      from: 'alerts@example.com',
      smarthost: 'smtp.gmail.com:587',
      auth_username: 'alerts@example.com',
      require_tls: true,
    } as EmailAlertReceiverResponse

    it('should render create mode with email fields', async () => {
      renderWithProviders(<NotificationChannelModal onClose={mockOnClose} organizationId="org-123" type="EMAIL" />)

      expect(await screen.findByText('New email')).toBeInTheDocument()
      expect(await screen.findByLabelText('Display name')).toBeInTheDocument()
      expect(await screen.findByLabelText('To email')).toBeInTheDocument()
      expect(await screen.findByLabelText('From email')).toBeInTheDocument()
      expect(await screen.findByLabelText('SMTP Server')).toBeInTheDocument()
      expect(await screen.findByLabelText('SMTP Username')).toBeInTheDocument()
      expect(await screen.findByLabelText('SMTP Password')).toBeInTheDocument()
      expect(await screen.findByText('Require TLS')).toBeInTheDocument()
    })

    it('should render edit mode with email fields pre-filled', async () => {
      renderWithProviders(
        <NotificationChannelModal onClose={mockOnClose} organizationId="org-123" alertReceiver={emailAlertReceiver} />
      )

      expect(await screen.findByText('Edit email')).toBeInTheDocument()
      expect(await screen.findByDisplayValue('Email Notifications')).toBeInTheDocument()
      expect(await screen.findByDisplayValue('ops@example.com')).toBeInTheDocument()
      // Both "From email" and "SMTP Username" have the same value, so we check both exist
      const alertsEmails = await screen.findAllByDisplayValue('alerts@example.com')
      expect(alertsEmails).toHaveLength(2) // From email + SMTP Username
      expect(await screen.findByDisplayValue('smtp.gmail.com:587')).toBeInTheDocument()
    })

    it('should send test notification with email payload in create mode', async () => {
      const mockValidateAlertReceiver = jest.fn()
      mockUseValidateAlertReceiver.mockReturnValue({
        mutate: mockValidateAlertReceiver,
        isLoading: false,
      })

      const { userEvent } = renderWithProviders(
        <NotificationChannelModal onClose={mockOnClose} organizationId="org-123" type="EMAIL" />
      )

      const testButton = await screen.findByText('Send test notification')
      await userEvent.click(testButton)

      expect(mockValidateAlertReceiver).toHaveBeenCalledWith({
        payload: {
          alert_receiver: expect.objectContaining({
            type: 'EMAIL',
            name: 'Email notifications',
            send_resolved: true,
            organization_id: 'org-123',
            description: 'Email notifications for Qovery alerts',
          }),
        },
      })
    })
  })
})

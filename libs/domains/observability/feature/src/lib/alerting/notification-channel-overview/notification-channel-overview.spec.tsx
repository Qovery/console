import { type AlertReceiverResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAlertReceivers from '../../hooks/use-alert-receivers/use-alert-receivers'
import * as useDeleteAlertReceiver from '../../hooks/use-delete-alert-receiver/use-delete-alert-receiver'
import { NotificationChannelOverview } from './notification-channel-overview'

const mockUseAlertReceivers = jest.spyOn(useAlertReceivers, 'useAlertReceivers') as jest.Mock
const mockUseDeleteAlertReceiver = jest.spyOn(useDeleteAlertReceiver, 'useDeleteAlertReceiver') as jest.Mock

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: 'org-123' }),
}))

describe('NotificationChannelOverview', () => {
  const mockDeleteAlertReceiver = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDeleteAlertReceiver.mockReturnValue({
      mutateAsync: mockDeleteAlertReceiver,
    })
  })

  it('should render loader when loading', () => {
    mockUseAlertReceivers.mockReturnValue({
      data: [],
      isLoading: true,
    })

    const { container } = renderWithProviders(<NotificationChannelOverview />)

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render empty state when no alert receivers exist', () => {
    mockUseAlertReceivers.mockReturnValue({
      data: [],
      isLoading: false,
    })

    renderWithProviders(<NotificationChannelOverview />)

    expect(screen.getByText('No slack channel added yet')).toBeInTheDocument()
    expect(screen.getByText('Add your first channel to start sending notifications')).toBeInTheDocument()
    expect(screen.getByText('Add channel')).toBeInTheDocument()
  })

  it('should render table with alert receivers when they exist', () => {
    const alertReceivers: AlertReceiverResponse[] = [
      {
        id: 'receiver-1',
        name: 'My Channel',
        type: 'SLACK',
      } as AlertReceiverResponse,
      {
        id: 'receiver-2',
        name: 'Another Channel',
        type: 'SLACK',
      } as AlertReceiverResponse,
    ]

    mockUseAlertReceivers.mockReturnValue({
      data: alertReceivers,
      isLoading: false,
    })

    renderWithProviders(<NotificationChannelOverview />)

    expect(screen.getByText('Slack channels')).toBeInTheDocument()
    expect(screen.getByText('My Channel')).toBeInTheDocument()
    expect(screen.getByText('Another Channel')).toBeInTheDocument()
    expect(screen.getAllByText('Add channel')).toHaveLength(1)
  })
})

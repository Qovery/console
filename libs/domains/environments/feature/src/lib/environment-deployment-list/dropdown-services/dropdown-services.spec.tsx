import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { DropdownServices } from './dropdown-services'

jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dropdown-root" data-open={open} onClick={() => onOpenChange(!open)}>
      {children}
    </div>
  ),
  Trigger: ({ children, onClick, onPointerEnter, onPointerLeave }: any) => (
    <button
      data-testid="dropdown-trigger"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </button>
  ),
  Content: ({ children, onPointerEnter, onPointerLeave, className }: any) => (
    <div
      data-testid="dropdown-content"
      className={className}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  ),
  Item: ({ children, className }: any) => (
    <div data-testid="dropdown-item" className={className}>
      {children}
    </div>
  ),
  Portal: ({ children }: any) => <div data-testid="dropdown-portal">{children}</div>,
}))

const mockEnvironment = {
  organization: { id: '123' },
  project: { id: '456' },
  id: '789',
}

const mockDeploymentHistory = {
  identifier: {
    execution_id: 'exec-123',
  },
  trigger_action: 'STOP',
}

const mockStages = [
  {
    name: 'build',
    status: 'SUCCESS',
    duration: 'PT60M',
    services: [
      {
        identifier: {
          name: 'web-service',
          service_id: 'service-123',
          execution_id: 'exec-123',
          service_type: 'APPLICATION',
        },
        icon_uri: 'https://example.com/icon.png',
        details: {
          serviceType: 'APPLICATION',
        },
        total_duration: 'PT1M',
        status_details: {
          status: 'SUCCESS',
        },
        auditing_data: {
          updated_at: '2024-01-30T12:00:00Z',
        },
      },
    ],
  },
  {
    name: 'deploy',
    status: 'ERROR',
    duration: 'PT60M',
    services: [
      {
        identifier: {
          name: 'api-service',
          service_id: 'service-456',
          execution_id: 'exec-123',
          service_type: 'APPLICATION',
        },
        icon_uri: 'https://example.com/icon.png',
        details: {
          serviceType: 'APPLICATION',
        },
        total_duration: 'PT1M',
        status_details: {
          status: 'RUNNING',
        },
        auditing_data: {
          updated_at: '2024-01-30T12:01:00Z',
        },
      },
    ],
  },
]

describe('DropdownServices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all stages', () => {
    renderWithProviders(
      <DropdownServices environment={mockEnvironment} deploymentHistory={mockDeploymentHistory} stages={mockStages} />
    )

    const stageButtons = screen.getAllByTestId('dropdown-trigger')
    expect(stageButtons).toHaveLength(mockStages.length)
  })

  it('should truncate stages when more than max visible stages', () => {
    const manyStages = Array(6).fill(mockStages[0])
    renderWithProviders(
      <DropdownServices environment={mockEnvironment} deploymentHistory={mockDeploymentHistory} stages={manyStages} />
    )

    const stageButtons = screen.getAllByTestId('dropdown-trigger')
    expect(stageButtons).toHaveLength(4) // MAX_VISIBLE_STAGES
    expect(screen.getByText('2')).toBeInTheDocument() // Remaining count
  })

  it('should show dropdown content on hover/click', async () => {
    const { userEvent } = renderWithProviders(
      <DropdownServices environment={mockEnvironment} deploymentHistory={mockDeploymentHistory} stages={mockStages} />
    )

    const trigger = screen.getAllByTestId('dropdown-trigger')[0]
    await userEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Build')).toBeInTheDocument()
      expect(screen.getByText('web-service')).toBeInTheDocument()
      expect(screen.getAllByText('1m')[0]).toBeInTheDocument()
    })
  })
})

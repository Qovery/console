import { useLinks, useService } from '@qovery/domains/services/feature'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { HeaderLogs, type HeaderLogsProps } from './header-logs'

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useService: jest.fn(),
  useLinks: jest.fn(),
  ServiceAvatar: () => <div data-testid="service-avatar" />,
  ServiceLinksPopover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockProps: HeaderLogsProps = {
  type: 'DEPLOYMENT',
  serviceId: 'service-1',
  environment: {
    id: 'env-1',
    organization: { id: 'org-1' },
    project: { id: 'proj-1' },
  },
  serviceStatus: {
    id: 'status-1',
    state: 'RUNNING',
    steps: { total_computing_duration_sec: 125 },
  },
  environmentStatus: {
    id: 'env-status-1',
    state: 'RUNNING',
  },
}

describe('HeaderLogs', () => {
  beforeEach(() => {
    useService.mockReturnValue({
      data: {
        id: 'service-1',
        name: 'Test Service',
        serviceType: 'APPLICATION',
      },
    })
    useLinks.mockReturnValue({
      data: [
        { id: 'link-1', url: 'https://example.com', is_default: false, is_qovery_domain: false },
        { id: 'link-2', url: 'https://qovery.com', is_default: true, is_qovery_domain: true },
      ],
    })
  })

  it('renders correctly for deployment type', async () => {
    renderWithProviders(<HeaderLogs {...mockProps} />)

    expect(screen.getByText('Test Service')).toBeInTheDocument()
    expect(screen.getByText('2m : 5s')).toBeInTheDocument()
    expect(screen.getByTestId('service-avatar')).toBeInTheDocument()

    const linksButton = screen.getByRole('button', { name: /link/ })
    expect(within(linksButton).getByText('1 link')).toBeInTheDocument()
  })

  it('renders correctly for service type', () => {
    renderWithProviders(<HeaderLogs {...mockProps} type="SERVICE" />)

    expect(screen.getByText('Test Service')).toBeInTheDocument()
    expect(screen.queryByText('2m : 5s')).not.toBeInTheDocument()
  })

  it('displays correct number of links', () => {
    renderWithProviders(<HeaderLogs {...mockProps} />)
    expect(screen.getByText('1 link')).toBeInTheDocument()
  })

  it('renders children content', () => {
    renderWithProviders(
      <HeaderLogs {...mockProps}>
        <div data-testid="child-content">Child Content</div>
      </HeaderLogs>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})

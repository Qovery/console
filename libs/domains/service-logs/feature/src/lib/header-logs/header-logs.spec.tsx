import { type ReactNode } from 'react'
import { useLinks, useService } from '@qovery/domains/services/feature'
import { act, renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { HeaderLogs, type HeaderLogsProps } from './header-logs'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useSearch: () => ({}),
  useNavigate: () => jest.fn(),
  useParams: () => ({ organizationId: '1' }),
  useLocation: () => ({ pathname: '/', search: '' }),
  useRouter: () => ({
    buildLocation: () => ({ href: '/' }),
  }),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <a {...props} href={`${props.to}`}>
      {children}
    </a>
  ),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useService: jest.fn(),
  useLinks: jest.fn(),
  ServiceAvatar: () => <div data-testid="service-avatar" />,
  ServiceLinksPopover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ServiceActions: () => <div />,
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
  afterEach(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    useService.mockReturnValue({
      data: {
        id: 'service-1',
        name: 'Test Service',
        serviceType: 'APPLICATION',
        environment: {
          id: 'env-1',
          name: 'Environment 1',
          cloud_provider: 'AWS',
          mode: 'PRODUCTION',
          cluster_id: 'cluster-1',
        },
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
    renderWithProviders(<HeaderLogs {...mockProps} type="SERVICE" />)

    expect(screen.getByText('Test Service')).toBeInTheDocument()
    expect(screen.getByTestId('service-avatar')).toBeInTheDocument()

    expect(screen.getByText('Link')).toBeInTheDocument()
  })

  it('renders correctly for service type', () => {
    renderWithProviders(<HeaderLogs {...mockProps} type="SERVICE" />)

    expect(screen.getByText('Test Service')).toBeInTheDocument()
    expect(screen.queryByText('2m : 5s')).not.toBeInTheDocument()
  })

  it('displays correct number of links', () => {
    renderWithProviders(<HeaderLogs {...mockProps} type="SERVICE" />)
    expect(screen.getByText('Link')).toBeInTheDocument()
  })

  it('renders children content', () => {
    renderWithProviders(
      <HeaderLogs {...mockProps} type="SERVICE">
        <div data-testid="child-content">Child Content</div>
      </HeaderLogs>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('excludes non-computing overhead from a completed deployment duration', () => {
    renderWithProviders(
      <HeaderLogs
        {...mockProps}
        serviceStatus={{
          ...mockProps.serviceStatus,
          status_details: { action: 'DEPLOY', status: 'SUCCESS', sub_action: 'NONE' },
          steps: {
            total_computing_duration_sec: 47,
            total_duration_sec: 53,
            details: [
              { step_name: 'BUILD', status: 'SUCCESS', duration_sec: 4 },
              { step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 43 },
            ],
          },
        }}
      />
    )

    expect(screen.getByText('0m : 47s')).toBeInTheDocument()
    expect(screen.queryByText('0m : 53s')).not.toBeInTheDocument()
  })

  it('adds the elapsed ongoing step duration to the completed step durations', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-08-28T13:30:00Z'))

    renderWithProviders(
      <HeaderLogs
        {...mockProps}
        serviceStatus={{
          ...mockProps.serviceStatus,
          status_details: { action: 'DEPLOY', status: 'ONGOING', sub_action: 'NONE' },
          steps: {
            total_computing_duration_sec: 17,
            total_duration_sec: null,
            details: [
              { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 2 },
              { step_name: 'BUILD', status: 'SUCCESS', duration_sec: 15 },
              {
                step_name: 'DEPLOYMENT',
                status: 'ONGOING',
                duration_sec: 0,
                started_at: '2026-08-28T13:29:30Z',
              },
            ],
          },
        }}
      />
    )

    expect(screen.getByText('0m : 47s')).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(1_000))

    expect(screen.getByText('0m : 48s')).toBeInTheDocument()
  })

  it('does not use the last deployment date as computing time when step details are empty', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-08-28T13:30:00Z'))

    renderWithProviders(
      <HeaderLogs
        {...mockProps}
        serviceStatus={{
          ...mockProps.serviceStatus,
          last_deployment_date: '2026-08-28T13:29:30Z',
          status_details: { action: 'DEPLOY', status: 'ONGOING', sub_action: 'NONE' },
          steps: { total_computing_duration_sec: 0, total_duration_sec: null, details: [] },
        }}
      />
    )

    expect(screen.getByText('0m : 0s')).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(1_000))

    expect(screen.getByText('0m : 0s')).toBeInTheDocument()
  })

  it('uses recorded computing time when no step has a live start time', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-08-28T13:30:00Z'))

    renderWithProviders(
      <HeaderLogs
        {...mockProps}
        serviceStatus={{
          ...mockProps.serviceStatus,
          last_deployment_date: '2026-08-28T13:29:30Z',
          status_details: { action: 'DEPLOY', status: 'ONGOING', sub_action: 'NONE' },
          steps: {
            total_computing_duration_sec: 17,
            total_duration_sec: null,
            details: [
              { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 2 },
              { step_name: 'BUILD', status: 'SUCCESS', duration_sec: 15 },
              { step_name: 'DEPLOYMENT', status: 'ONGOING', duration_sec: 0 },
            ],
          },
        }}
      />
    )

    expect(screen.getByText('0m : 17s')).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(1_000))

    expect(screen.getByText('0m : 17s')).toBeInTheDocument()
  })

  it('does not decrease when step timing becomes available', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-08-28T13:30:00Z'))

    const { rerender } = renderWithProviders(
      <HeaderLogs
        {...mockProps}
        serviceStatus={{
          ...mockProps.serviceStatus,
          last_deployment_date: '2026-08-28T13:29:30Z',
          status_details: { action: 'DEPLOY', status: 'ONGOING', sub_action: 'NONE' },
          steps: { total_computing_duration_sec: 0, total_duration_sec: null, details: [] },
        }}
      />
    )

    expect(screen.getByText('0m : 0s')).toBeInTheDocument()

    rerender(
      <HeaderLogs
        {...mockProps}
        serviceStatus={{
          ...mockProps.serviceStatus,
          last_deployment_date: '2026-08-28T13:29:30Z',
          status_details: { action: 'DEPLOY', status: 'ONGOING', sub_action: 'NONE' },
          steps: {
            total_computing_duration_sec: 0,
            total_duration_sec: null,
            details: [
              {
                step_name: 'DEPLOYMENT',
                status: 'ONGOING',
                duration_sec: 0,
                started_at: '2026-08-28T13:30:00Z',
              },
            ],
          },
        }}
      />
    )

    expect(screen.getByText('0m : 0s')).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(1_000))

    expect(screen.getByText('0m : 1s')).toBeInTheDocument()
  })

  it('falls back to the recorded computing duration without timing data', () => {
    renderWithProviders(
      <HeaderLogs
        {...mockProps}
        serviceStatus={{
          ...mockProps.serviceStatus,
          status_details: { action: 'DEPLOY', status: 'ONGOING', sub_action: 'NONE' },
          steps: { total_computing_duration_sec: 17, total_duration_sec: null, details: [] },
        }}
      />
    )

    expect(screen.getByText('0m : 17s')).toBeInTheDocument()
  })
})

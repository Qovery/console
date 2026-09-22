import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterRunningStatus } from '../hooks/use-cluster-running-status/use-cluster-running-status'
import { ClusterQuotaWarningCallout } from './cluster-quota-warning-callout'
import { activeQuotaWarning } from './cluster-quota-warning.fixture'

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ organizationId: 'org-id', clusterId: 'cluster-id' }),
}))
jest.mock('../hooks/use-cluster-running-status/use-cluster-running-status')

const mockUseClusterRunningStatus = useClusterRunningStatus as jest.MockedFunction<typeof useClusterRunningStatus>

describe('ClusterQuotaWarningCallout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the quota warning when it is active', () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'WARNING',
          quota_warning: activeQuotaWarning,
        },
      },
    } as unknown as ReturnType<typeof useClusterRunningStatus>)

    renderWithProviders(<ClusterQuotaWarningCallout />)

    expect(mockUseClusterRunningStatus).toHaveBeenCalledWith({ organizationId: 'org-id', clusterId: 'cluster-id' })
    expect(screen.getByText('AWS quota issue: Spot Instance requests')).toBeInTheDocument()
    expect(screen.getByText(activeQuotaWarning.message)).toBeInTheDocument()
    expect(screen.getByText(activeQuotaWarning.suggested_action)).toBeInTheDocument()
  })

  it('renders nothing when there is no active quota warning', () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'RUNNING',
        },
      },
    } as unknown as ReturnType<typeof useClusterRunningStatus>)

    renderWithProviders(<ClusterQuotaWarningCallout />)

    expect(screen.queryByText(/quota issue/i)).not.toBeInTheDocument()
    expect(screen.queryByText(activeQuotaWarning.message)).not.toBeInTheDocument()
  })
})

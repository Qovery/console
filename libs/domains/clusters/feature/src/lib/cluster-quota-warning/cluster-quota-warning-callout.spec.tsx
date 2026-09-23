import { type ClusterQuotaWarningDto } from 'qovery-ws-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterRunningStatus } from '../hooks/use-cluster-running-status/use-cluster-running-status'
import { ClusterQuotaWarningCallout } from './cluster-quota-warning-callout'

const activeQuotaWarning = {
  status: 'ACTIVE',
  provider: 'AWS',
  source: 'KARPENTER_EVENT',
  quota_code: 'MaxSpotInstanceCountExceeded',
  quota_name: 'Spot Instance requests',
  resource: 'EC2 Spot instances',
  region: null,
  message: 'AWS refused to create new nodes because the Spot Instance requests quota has been reached.',
  suggested_action: 'Request an AWS quota increase, then retry or wait for the cluster to scale again.',
  detected_at: 1790004098000,
  last_seen_at: 1790004098000,
} satisfies ClusterQuotaWarningDto

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
    expect(
      screen.getByText(`Impacted resource: ${activeQuotaWarning.resource}. ${activeQuotaWarning.suggested_action}`)
    ).toBeInTheDocument()
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

  it('falls back to the quota code when optional quota details are missing', () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'WARNING',
          quota_warning: {
            ...activeQuotaWarning,
            quota_name: null,
            resource: null,
          },
        },
      },
    } as unknown as ReturnType<typeof useClusterRunningStatus>)

    renderWithProviders(<ClusterQuotaWarningCallout />)

    expect(screen.getByText(`AWS quota issue: ${activeQuotaWarning.quota_code}`)).toBeInTheDocument()
    expect(screen.queryByText(/Impacted resource:/)).not.toBeInTheDocument()
  })
})

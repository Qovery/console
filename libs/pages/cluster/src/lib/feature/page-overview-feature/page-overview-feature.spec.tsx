import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOverviewFeature from './page-overview-feature'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useClusterRunningStatus: jest.fn(),
}))

describe('PageOverviewFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: 'NotFound',
    })
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOverviewFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should render placeholder when running status is unavailable', () => {
    renderWithProviders(<PageOverviewFeature />)
    expect(screen.getByText('No metrics available because the running status is unavailable.')).toBeInTheDocument()
  })
})

import { renderWithProviders } from '@qovery/shared/util-tests'
import { useServiceInstances } from '../hooks/use-service-instances/use-service-instances'
import { useServiceLevels } from '../hooks/use-service-levels/use-service-levels'
import { SearchServiceLogs } from './search-service-logs'

jest.mock('../hooks/use-service-levels/use-service-levels')
jest.mock('../hooks/use-service-instances/use-service-instances')

const mockUseServiceLevels = useServiceLevels as jest.Mock
const mockUseServiceInstances = useServiceInstances as jest.Mock

describe('SearchServiceLogs', () => {
  beforeEach(() => {
    mockUseServiceLevels.mockReturnValue({
      data: ['INFO', 'ERROR'],
      isFetched: true,
    })
    mockUseServiceInstances.mockReturnValue({
      data: ['instance-1', 'instance-2'],
      isFetched: true,
    })
  })

  it('renders search input when data is fetched', () => {
    const { container } = renderWithProviders(
      <SearchServiceLogs clusterId="cluster-1" serviceId="service-1" isLoading={false} />
    )

    expect(container.querySelector('input[placeholder="Search logs…"]')).toBeInTheDocument()
  })

  it('does not render until data is fetched', () => {
    mockUseServiceLevels.mockReturnValue({
      data: [],
      isFetched: false,
    })

    const { container } = renderWithProviders(
      <SearchServiceLogs clusterId="cluster-1" serviceId="service-1" isLoading={false} />
    )

    expect(container.querySelector('input')).not.toBeInTheDocument()
  })
})

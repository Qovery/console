import { render } from '__tests__/utils/setup-jest'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageInfraLogs from './page-infra-logs'

const cluster = clusterFactoryMock(1)[0]

const useClusterMockSpy = jest.spyOn(clustersDomain, 'useCluster') as jest.Mock
const useClusterStatusMockSpy = jest.spyOn(clustersDomain, 'useClusterStatus') as jest.Mock
const useClusterLogsMockSpy = jest.spyOn(clustersDomain, 'useClusterLogs') as jest.Mock

describe('PageInfraLogs', () => {
  beforeEach(() => {
    useClusterMockSpy.mockReturnValue({
      data: cluster,
      isLoading: false,
    })
    useClusterStatusMockSpy.mockReturnValue({
      data: { state: 'DEPLOYED' },
      isLoading: false,
    })
    useClusterLogsMockSpy.mockReturnValue({
      data: [],
      isLoading: false,
    })
  })
  it('should render successfully', () => {
    const { baseElement } = render(<PageInfraLogs />)
    expect(baseElement).toBeTruthy()
  })
})

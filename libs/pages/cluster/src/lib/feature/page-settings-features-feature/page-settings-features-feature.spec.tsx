import { render } from '__tests__/utils/setup-jest'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { ClusterEntity } from '@qovery/shared/interfaces'
import PageSettingsFeaturesFeature from './page-settings-features-feature'

const mockCluster: ClusterEntity = clusterFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    selectClusterById: () => mockCluster,
    selectClustersLoadingStatus: () => 'loaded',
  }
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ clusterId: mockCluster.id }),
}))

describe('PageSettingsFeaturesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsFeaturesFeature />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageSettingsFeaturesFeature from './page-settings-features-feature'

const mockCluster = clusterFactoryMock(1)[0]

jest.mock('@qovery/domains/clusters/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/clusters/feature'),
    useCluster: () => ({ data: mockCluster, isLoading: false }),
  }
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organization: '1', clusterId: mockCluster.id }),
}))

describe('PageSettingsFeaturesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsFeaturesFeature />)
    expect(baseElement).toBeTruthy()
  })
})

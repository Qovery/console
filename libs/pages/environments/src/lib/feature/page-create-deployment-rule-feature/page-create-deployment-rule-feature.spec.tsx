import { render } from '__tests__/utils/setup-jest'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageCreateDeploymentRuleFeature from './page-create-deployment-rule-feature'

const mockClusters = clusterFactoryMock(3)
jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useClusters: () => ({ data: mockClusters }),
}))

describe('PageCreateDeploymentRuleFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageCreateDeploymentRuleFeature />)
    expect(baseElement).toBeTruthy()
  })
})

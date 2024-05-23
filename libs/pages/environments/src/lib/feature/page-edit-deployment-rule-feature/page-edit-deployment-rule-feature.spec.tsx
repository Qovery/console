import { render } from '__tests__/utils/setup-jest'
import PageEditDeploymentRuleFeature from './page-edit-deployment-rule-feature'

describe('PageEditDeploymentRuleFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageEditDeploymentRuleFeature />)
    expect(baseElement).toBeTruthy()
  })
})

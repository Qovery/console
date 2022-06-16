import { render } from '__tests__/utils/setup-jest'
import { PageDeploymentRulesFeature } from './page-deployment-rules-feature'

describe('DeploymentRules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDeploymentRulesFeature />)
    expect(baseElement).toBeTruthy()
  })
})

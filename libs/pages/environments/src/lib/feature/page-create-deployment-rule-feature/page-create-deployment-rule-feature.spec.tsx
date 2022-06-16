import { render } from '__tests__/utils/setup-jest'

import PageCreateDeploymentRuleFeature from './page-create-deployment-rule-feature'

describe('PageCreateDeploymentRuleFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageCreateDeploymentRuleFeature />)
    expect(baseElement).toBeTruthy()
  })
})

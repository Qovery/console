import { render } from '__tests__/utils/setup-jest'

import PageDeploymentRules, { PageDeploymentRulesProps } from './page-deployment-rules'

let props: PageDeploymentRulesProps

describe('DeploymentRules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDeploymentRules {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

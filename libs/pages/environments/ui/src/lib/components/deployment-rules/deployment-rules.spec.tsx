import { render } from '__tests__/utils/setup-jest'

import DeploymentRules, { DeploymentRulesProps } from './deployment-rules'

let props: DeploymentRulesProps

describe('DeploymentRules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentRules {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

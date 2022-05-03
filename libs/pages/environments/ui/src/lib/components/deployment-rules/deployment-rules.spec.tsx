import { render } from '__tests__/utils/setup-jest'

import DeploymentRules from './deployment-rules'

describe('DeploymentRules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentRules />)
    expect(baseElement).toBeTruthy()
  })
})

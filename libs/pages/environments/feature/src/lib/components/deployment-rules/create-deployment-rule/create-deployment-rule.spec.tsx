import { render } from '__tests__/utils/setup-jest'

import CreateDeploymentRule from './create-deployment-rule'

describe('CreateDeploymentRule', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CreateDeploymentRule />)
    expect(baseElement).toBeTruthy()
  })
})

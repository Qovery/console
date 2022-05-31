import { render } from '__tests__/utils/setup-jest'

import EditDeploymentRule from './edit-deployment-rule'

describe('EditDeploymentRule', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EditDeploymentRule />)
    expect(baseElement).toBeTruthy()
  })
})

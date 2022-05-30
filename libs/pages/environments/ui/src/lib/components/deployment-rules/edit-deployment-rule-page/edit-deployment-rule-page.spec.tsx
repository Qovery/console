import { render } from '@testing-library/react'

import EditDeploymentRulePage from './edit-deployment-rule-page'

describe('EditDeploymentRulePage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EditDeploymentRulePage />)
    expect(baseElement).toBeTruthy()
  })
})

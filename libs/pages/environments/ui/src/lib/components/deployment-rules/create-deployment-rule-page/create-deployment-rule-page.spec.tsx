import { render } from '@testing-library/react'

import CreateDeploymentRulePage from './create-deployment-rule-page'

describe('CreateDeploymentRulePage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CreateDeploymentRulePage />)
    expect(baseElement).toBeTruthy()
  })
})

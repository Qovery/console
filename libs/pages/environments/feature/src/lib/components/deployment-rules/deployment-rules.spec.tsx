import { render } from '@testing-library/react'

import DeploymentRules from './deployment-rules'

describe('DeploymentRules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentRules />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'

import CreateDeploymentRule from './create-deployment-rule'

describe('CreateDeploymentRule', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CreateDeploymentRule />)
    expect(baseElement).toBeTruthy()
  })
})

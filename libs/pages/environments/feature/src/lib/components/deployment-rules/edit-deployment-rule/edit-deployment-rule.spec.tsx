import { render } from '@testing-library/react'

import EditDeploymentRule from './edit-deployment-rule'

describe('EditDeploymentRule', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EditDeploymentRule />)
    expect(baseElement).toBeTruthy()
  })
})

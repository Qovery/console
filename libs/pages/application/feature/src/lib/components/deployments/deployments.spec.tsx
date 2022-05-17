import { render } from '@testing-library/react'

import Deployments from './deployments'

describe('Deployments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Deployments />)
    expect(baseElement).toBeTruthy()
  })
})

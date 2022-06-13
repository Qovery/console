import { render } from '@testing-library/react'

import DeploymentsPage from './deployments-page'

describe('DeploymentsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentsPage />)
    expect(baseElement).toBeTruthy()
  })
})

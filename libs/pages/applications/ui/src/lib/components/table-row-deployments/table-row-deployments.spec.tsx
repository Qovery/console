import { render } from '@testing-library/react'

import TableRowDeployments from './table-row-deployments'

describe('TableRowDeployments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowDeployments />)
    expect(baseElement).toBeTruthy()
  })
})

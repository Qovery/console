import { render } from '@testing-library/react'

import TableRowDeployment from './table-row-deployment'

describe('TableRowDeployment', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowDeployment />)
    expect(baseElement).toBeTruthy()
  })
})

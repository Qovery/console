import { render } from '@testing-library/react'

import TableGroupDeployments from './table-group-deployments'

describe('TableGroupDeployments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableGroupDeployments />)
    expect(baseElement).toBeTruthy()
  })
})

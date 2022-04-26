import { render } from '@testing-library/react'

import TableRowEnvironments from './table-row-environments'

describe('TableRowEnvironments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowEnvironments />)
    expect(baseElement).toBeTruthy()
  })
})

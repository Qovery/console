import { render } from '@testing-library/react'

import TableRowApplications from './table-row-applications'

describe('TableRowApplications', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowApplications />)
    expect(baseElement).toBeTruthy()
  })
})

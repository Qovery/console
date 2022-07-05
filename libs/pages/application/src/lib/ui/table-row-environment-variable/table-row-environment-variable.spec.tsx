import { render } from '@testing-library/react'

import TableRowEnvironmentVariable from './table-row-environment-variable'

describe('TableRowEnvironmentVariable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowEnvironmentVariable />)
    expect(baseElement).toBeTruthy()
  })
})

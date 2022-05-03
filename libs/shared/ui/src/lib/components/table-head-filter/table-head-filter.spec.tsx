import { render } from '@testing-library/react'

import TableHeadFilter from './table-head-filter'

describe('TableHeadFilter', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableHeadFilter />)
    expect(baseElement).toBeTruthy()
  })
})

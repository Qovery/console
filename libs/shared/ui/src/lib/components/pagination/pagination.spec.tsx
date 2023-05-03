import { render } from '@testing-library/react'
import Pagination from './pagination'

describe('Pagination', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Pagination />)
    expect(baseElement).toBeTruthy()
  })
})

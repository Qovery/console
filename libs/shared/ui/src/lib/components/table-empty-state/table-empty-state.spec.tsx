import { render } from '@testing-library/react'
import TableEmptyState from './table-empty-state'

describe('TableEmptyState', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableEmptyState />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'
import TableClusters from './table-clusters'

describe('TableClusters', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableClusters />)
    expect(baseElement).toBeTruthy()
  })
})

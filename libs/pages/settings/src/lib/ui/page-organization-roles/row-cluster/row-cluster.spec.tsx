import { render } from '@testing-library/react'
import RowCluster from './row-cluster'

describe('RowCluster', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowCluster />)
    expect(baseElement).toBeTruthy()
  })
})

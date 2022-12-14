import { render } from '@testing-library/react'
import PageClusters from './page-clusters'

describe('PageClusters', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageClusters />)
    expect(baseElement).toBeTruthy()
  })
})

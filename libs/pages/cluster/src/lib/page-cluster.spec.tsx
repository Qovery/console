import { render } from '@testing-library/react'
import PageCluster from './page-cluster'

describe('PageCluster', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageCluster />)
    expect(baseElement).toBeTruthy()
  })
})

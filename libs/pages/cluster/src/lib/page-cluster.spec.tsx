import { render } from '@testing-library/react'
import PagesCluster from './page-cluster'

describe('PagesCluster', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesCluster />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'
import CardCluster from './card-cluster'

describe('CardCluster', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CardCluster />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'

import CardClusterFeature from './card-cluster-feature'

describe('CardClusterFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CardClusterFeature />)
    expect(baseElement).toBeTruthy()
  })
})

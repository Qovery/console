import { render } from '@testing-library/react'

import Metrics from './metrics'

describe('Metrics', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Metrics />)
    expect(baseElement).toBeTruthy()
  })
})

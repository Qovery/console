import { render } from '@testing-library/react'
import FunnelFlow from './funnel-flow'

describe('FunnelFlow', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FunnelFlow />)
    expect(baseElement).toBeTruthy()
  })
})

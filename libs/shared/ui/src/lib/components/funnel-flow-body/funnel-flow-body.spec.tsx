import { render } from '@testing-library/react'
import FunnelFlowBody from './funnel-flow-body'

describe('FunnelFlowBody', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FunnelFlowBody />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'
import FunnelFlowHelpCard from './funnel-flow-help-card'

describe('FunnelFlowHelpCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FunnelFlowHelpCard />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import FunnelFlowHelpCard, { FunnelFlowHelpCardProps } from './funnel-flow-help-card'

const props: FunnelFlowHelpCardProps = {
  title: 'Title',
  className: 'test',
  items: ['Item 1', 'Item 2'],
}

describe('FunnelFlowHelpCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FunnelFlowHelpCard {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

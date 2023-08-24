import { render } from '__tests__/utils/setup-jest'
import FunnelFlow, { type FunnelFlowProps } from './funnel-flow'

const props: FunnelFlowProps = {
  onExit: jest.fn(),
  totalSteps: 10,
  children: <div>Content</div>,
  currentStep: 6,
  currentTitle: 'Title',
  portal: false,
}

describe('FunnelFlow', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FunnelFlow {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render correct current step and number of steps', () => {
    const { getByText } = render(<FunnelFlow {...props} />)
    getByText('6/10')
  })

  it('should render the title', () => {
    const { getByText } = render(<FunnelFlow {...props} />)
    getByText('Title')
  })

  it('should render the children', () => {
    const { getByText } = render(<FunnelFlow {...props} />)
    getByText('Content')
  })

  it('should call onExit when clicking on the exit button', () => {
    const { getByText } = render(<FunnelFlow {...props} />)
    getByText('Close').click()
    expect(props.onExit).toHaveBeenCalled()
  })
})

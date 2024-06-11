import { getByTestId, getByText, queryByTestId, render } from '__tests__/utils/setup-jest'
import { type ReactNode } from 'react'
import FunnelFlowBody from './funnel-flow-body'

describe('FunnelFlowBody', () => {
  let children: ReactNode
  let helpSection: ReactNode

  beforeEach(() => {
    children = <div>Content</div>
    helpSection = <div>Help</div>
  })
  it('should render successfully', () => {
    const { baseElement } = render(<FunnelFlowBody helpSection={helpSection}>{children}</FunnelFlowBody>)
    expect(baseElement).toBeTruthy()
  })

  it('should render help section on the side', () => {
    const { baseElement } = render(<FunnelFlowBody helpSection={helpSection}>{children}</FunnelFlowBody>)
    expect(baseElement).toBeTruthy()

    getByText(getByTestId(baseElement, 'funnel-body-help'), 'Help')
  })

  it('should render body section in the section tag', () => {
    const { baseElement } = render(<FunnelFlowBody helpSection={helpSection}>{children}</FunnelFlowBody>)
    expect(baseElement).toBeTruthy()

    getByText(getByTestId(baseElement, 'funnel-body-content'), 'Content')
  })

  it('should not render help section on the side', () => {
    const { baseElement } = render(<FunnelFlowBody>{children}</FunnelFlowBody>)

    expect(queryByTestId(baseElement, 'funnel-body-help')).not.toBeInTheDocument()
  })
})

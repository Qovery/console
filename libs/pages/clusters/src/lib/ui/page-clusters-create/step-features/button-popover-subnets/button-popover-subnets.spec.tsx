import { render } from '@testing-library/react'
import ButtonPopoverSubnets from './button-popover-subnets'

describe('ButtonPopoverSubnets', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonPopoverSubnets />)
    expect(baseElement).toBeTruthy()
  })
})

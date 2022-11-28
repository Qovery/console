import { render } from '@testing-library/react'
import FlowCreateVariable from './flow-create-variable'

describe('FlowCreateVariable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FlowCreateVariable />)
    expect(baseElement).toBeTruthy()
  })
})

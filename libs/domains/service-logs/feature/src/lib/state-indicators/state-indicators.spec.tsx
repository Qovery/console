import { render } from '@testing-library/react'
import StateIndicator from './state-indicator'

describe('StateIndicator', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StateIndicator />)
    expect(baseElement).toBeTruthy()
  })
})

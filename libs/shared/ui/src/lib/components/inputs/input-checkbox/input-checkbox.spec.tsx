import { render } from '@testing-library/react'
import InputCheckbox from './input-checkbox'

describe('InputCheckbox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputCheckbox />)
    expect(baseElement).toBeTruthy()
  })
})

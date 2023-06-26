import { render } from '@testing-library/react'
import InputFilter from './input-filter'

describe('InputFilter', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputFilter />)
    expect(baseElement).toBeTruthy()
  })
})

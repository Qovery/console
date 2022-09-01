import { render } from '@testing-library/react'
import InputSizeUnit from './input-size-unit'

describe('InputSizeUnit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSizeUnit />)
    expect(baseElement).toBeTruthy()
  })
})

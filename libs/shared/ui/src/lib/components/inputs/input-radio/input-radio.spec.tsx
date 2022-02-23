import { render } from '@testing-library/react'

import InputRadio from './input-radio'

describe('InputRadio', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputRadio />)
    expect(baseElement).toBeTruthy()
  })
})

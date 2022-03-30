import { render } from '@testing-library/react'

import InputTextArea from './input-text-area'

describe('InputTextArea', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputTextArea />)
    expect(baseElement).toBeTruthy()
  })
})

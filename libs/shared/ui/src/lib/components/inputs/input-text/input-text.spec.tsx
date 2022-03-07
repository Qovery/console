import { render } from '@testing-library/react'

import InputText from './input-text'

describe('InputText', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputText />)
    expect(baseElement).toBeTruthy()
  })
})

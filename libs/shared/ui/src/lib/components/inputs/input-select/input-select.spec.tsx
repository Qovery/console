import { render } from '@testing-library/react'

import InputSelect from './input-select'

describe('InputSelect', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSelect />)
    expect(baseElement).toBeTruthy()
  })
})

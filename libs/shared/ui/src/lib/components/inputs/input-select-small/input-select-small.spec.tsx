import { render } from '@testing-library/react'

import InputSelectSmall from './input-select-small'

describe('InputSelectSmall', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSelectSmall />)
    expect(baseElement).toBeTruthy()
  })
})

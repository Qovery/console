import { render } from '@testing-library/react'

import Variables from './variables'

describe('Variables', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Variables />)
    expect(baseElement).toBeTruthy()
  })
})

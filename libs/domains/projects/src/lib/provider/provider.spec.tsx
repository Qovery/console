import { render } from '@testing-library/react'

import Provider from './provider'

describe('Provider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Provider />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'

import About from './about'

describe('About', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<About />)
    expect(baseElement).toBeTruthy()
  })
})

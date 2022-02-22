import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Navbar from './navbar'

describe('Navbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Navbar />, { wrapper: MemoryRouter })
    expect(baseElement).toBeTruthy()
  })
})

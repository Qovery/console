import { renderWithRouter } from '__mocks__/utils/test-utils'

import Navbar from './navbar'

describe('Navbar', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<Navbar />)
    expect(baseElement).toBeTruthy()
  })
})

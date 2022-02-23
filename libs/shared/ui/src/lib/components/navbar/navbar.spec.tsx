import { render } from '__mocks__/utils/test-utils'

import Navbar from './navbar'

describe('Navbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Navbar />)
    expect(baseElement).toBeTruthy()
  })
})

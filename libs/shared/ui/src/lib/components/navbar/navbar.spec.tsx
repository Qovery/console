import { render } from '__tests__/utils/setup-jest'

import Navbar from './navbar'

describe('Navbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Navbar />)
    expect(baseElement).toBeTruthy()
  })
})

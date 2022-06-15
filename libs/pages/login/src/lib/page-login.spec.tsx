import { render } from '__tests__/utils/setup-jest'

import PageLogin from './page-login'

describe('PageLogin', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageLogin />)
    expect(baseElement).toBeTruthy()
  })
})

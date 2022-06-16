import { render } from '__tests__/utils/setup-jest'

import PageLoginFeature from './page-login'

describe('PageLoginFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageLoginFeature />)
    expect(baseElement).toBeTruthy()
  })
})

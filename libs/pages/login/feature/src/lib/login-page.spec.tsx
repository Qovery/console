import { render } from '__mocks__/utils/test-utils'

import PagesLoginFeature from './login-page'

describe('PagesLoginFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesLoginFeature />)
    expect(baseElement).toBeTruthy()
  })
})

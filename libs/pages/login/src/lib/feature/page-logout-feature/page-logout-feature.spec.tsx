import PageLogoutFeature from './page-logout-feature'
import { render } from '__tests__/utils/setup-jest'

describe('PageLogoutFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageLogoutFeature />)
    expect(baseElement).toBeTruthy()
  })
})

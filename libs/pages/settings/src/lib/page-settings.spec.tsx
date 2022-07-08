import { render } from '__tests__/utils/setup-jest'
import PagesSettings from './page-settings'

describe('PagesSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesSettings />)
    expect(baseElement).toBeTruthy()
  })
})

import PageApplication from './page-application'
import { render } from '__tests__/utils/setup-jest'

describe('PagesApplication', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplication />)
    expect(baseElement).toBeTruthy()
  })
})

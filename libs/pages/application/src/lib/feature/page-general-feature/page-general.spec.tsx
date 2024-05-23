import { render } from '__tests__/utils/setup-jest'
import PageGeneralFeature from './page-general-feature'

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})

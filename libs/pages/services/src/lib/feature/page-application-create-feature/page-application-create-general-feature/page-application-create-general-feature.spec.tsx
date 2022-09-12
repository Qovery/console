import { render } from '__tests__/utils/setup-jest'
import PageApplicationCreateGeneralFeature from './page-application-create-general-feature'

describe('PageApplicationCreateGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreateGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})

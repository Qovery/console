import { render } from '__tests__/utils/setup-jest'
import PageOrganizationGeneralFeature from './page-organization-general-feature'

describe('PageOrganizationGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})

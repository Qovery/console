import { render } from '__tests__/utils/setup-jest'
import PageOrganizationBillingFeature from './page-organization-billing-feature'

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  useGTMDispatch: jest.fn(() => jest.fn()),
}))

describe('PageOrganizationBillingFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBillingFeature />)
    expect(baseElement).toBeTruthy()
  })
})

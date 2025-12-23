import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationAICopilotFeature from './page-organization-ai-copilot-feature'

jest.mock('@qovery/domains/organizations/feature', () => ({
  useOrganization: () => ({
    data: {
      id: '1',
      name: 'Test Organization',
    },
  }),
}))

describe('PageOrganizationAICopilotFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationAICopilotFeature />)
    expect(baseElement).toBeTruthy()
  })
})

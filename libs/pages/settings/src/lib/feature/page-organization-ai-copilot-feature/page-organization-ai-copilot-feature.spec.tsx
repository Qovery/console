import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationAICopilotFeature from './page-organization-ai-copilot-feature'

describe('PageOrganizationAICopilotFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationAICopilotFeature />)
    expect(baseElement).toBeTruthy()
  })
})

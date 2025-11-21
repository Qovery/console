import { render } from '__tests__/utils/setup-jest'
import PageOrganizationAICopilotFeature from './page-organization-ai-copilot-feature'

describe('PageOrganizationAICopilotFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationAICopilotFeature />)
    expect(baseElement).toBeTruthy()
  })
})

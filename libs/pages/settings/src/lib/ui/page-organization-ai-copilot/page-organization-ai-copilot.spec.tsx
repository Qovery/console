import { render } from '__tests__/utils/setup-jest'
import PageOrganizationAICopilot, { type PageOrganizationAICopilotProps } from './page-organization-ai-copilot'

const props: PageOrganizationAICopilotProps = {
  organization: undefined,
}

describe('PageOrganizationAICopilot', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationAICopilot {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

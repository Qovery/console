import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationAICopilot, { type PageOrganizationAICopilotProps } from './page-organization-ai-copilot'

const props: PageOrganizationAICopilotProps = {
  organization: undefined,
}

describe('PageOrganizationAICopilot', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationAICopilot {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

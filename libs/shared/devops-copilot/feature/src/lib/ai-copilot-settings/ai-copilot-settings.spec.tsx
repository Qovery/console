import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import AICopilotSettings, { type AICopilotSettingsProps } from './ai-copilot-settings'

const props: AICopilotSettingsProps = {
  organization: organizationFactoryMock(1)[0],
}

describe('AICopilotSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<AICopilotSettings {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

import { renderWithProviders } from '@qovery/shared/util-tests'
import AICopilotSettings, { type AICopilotSettingsProps } from './ai-copilot-settings'

const props: AICopilotSettingsProps = {
  organization: undefined,
}

describe('AICopilotSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<AICopilotSettings {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

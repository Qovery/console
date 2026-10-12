import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import AICopilotSettings, { type AICopilotSettingsProps } from './ai-copilot-settings'

jest.mock('../hooks/use-ai-copilot-recurring-tasks/use-ai-copilot-recurring-tasks', () => ({
  useAICopilotRecurringTasks: () => ({ data: { tasks: [] }, isLoading: false }),
}))

jest.mock('@qovery/shared/iam/feature', () => ({
  ...jest.requireActual('@qovery/shared/iam/feature'),
  useUserAccount: () => ({ data: undefined }),
}))

const props: AICopilotSettingsProps = {
  organization: organizationFactoryMock(1)[0],
}

describe('AICopilotSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<AICopilotSettings {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

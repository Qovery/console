import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import AICopilotSettings, { type AICopilotSettingsProps } from './ai-copilot-settings'

jest.mock('../hooks/use-ai-copilot-recurring-tasks/use-ai-copilot-recurring-tasks', () => ({
  useAICopilotRecurringTasks: () => ({ data: { tasks: [] }, isLoading: false }),
}))

jest.mock('../hooks/use-ai-copilot-config/use-ai-copilot-config', () => ({
  useAICopilotConfig: () => ({
    data: { org_config: { enabled: true, read_only: true, token_mode: 'jwt' }, role_configs: [] },
    isLoading: false,
  }),
}))

const mockMutate = jest.fn()
jest.mock('../hooks/use-update-ai-copilot-config/use-update-ai-copilot-config', () => ({
  useUpdateAICopilotConfig: () => ({ mutate: mockMutate, isLoading: false }),
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

  it('shows a Preview badge next to its title, and a short note instead of a callout', () => {
    renderWithProviders(<AICopilotSettings {...props} />)
    expect(screen.getByRole('heading', { name: /Copilot configuration/ })).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByTestId('copilot-preview-note')).toHaveTextContent('Functionality may change.')
  })

  it('leaves the page title to its host when embedded', () => {
    renderWithProviders(<AICopilotSettings {...props} embedded />)
    expect(screen.queryByRole('heading', { name: /Copilot configuration/ })).not.toBeInTheDocument()
    expect(screen.getByTestId('copilot-preview-note')).toBeInTheDocument()
  })

  it('turns the Copilot off only after a confirmation', async () => {
    const { userEvent } = renderWithProviders(<AICopilotSettings {...props} />)
    await userEvent.click(screen.getByRole('button', { name: 'Turn off Copilot' }))
    expect(mockMutate).not.toHaveBeenCalled()

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Turn off Copilot' }))
    expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })
})

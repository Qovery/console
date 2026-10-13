import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useAICopilotConfig } from '../hooks/use-ai-copilot-config/use-ai-copilot-config'
import AICopilotSettings from './ai-copilot-settings'

const mockMutate = jest.fn()
let mockCanManage = true
jest.mock('../hooks/use-ai-copilot-config/use-ai-copilot-config', () => ({ useAICopilotConfig: jest.fn() }))
jest.mock('../hooks/use-update-ai-copilot-config/use-update-ai-copilot-config', () => ({
  useUpdateAICopilotConfig: () => ({ mutate: mockMutate, isLoading: false }),
}))
jest.mock('../hooks/use-ai-copilot-recurring-tasks/use-ai-copilot-recurring-tasks', () => ({
  useAICopilotRecurringTasks: () => ({ data: { tasks: [] }, isLoading: false }),
}))
jest.mock('@qovery/shared/iam/feature', () => ({
  ...jest.requireActual('@qovery/shared/iam/feature'),
  useUserAccount: () => ({ data: undefined }),
  useUserRole: () => ({ roles: mockCanManage ? [`organization:${mockOrganization.id}:admin`] : [] }),
}))
const mockOrganization = organizationFactoryMock(1)[0]
const mockConfig = jest.mocked(useAICopilotConfig)
const mockRefetch = jest.fn()
function setConfig(enabled: boolean, overrides = {}) {
  mockConfig.mockReturnValue({
    data: { org_config: { enabled, read_only: true }, role_configs: [] },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    ...overrides,
  } as unknown as ReturnType<typeof useAICopilotConfig>)
}
describe('AICopilotSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCanManage = true
    setConfig(true)
  })
  it('shows active read-only configuration without activation or mutations on mount', () => {
    renderWithProviders(<AICopilotSettings organization={mockOrganization} />)
    expect(screen.getByText('Active · Read-only mode')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(mockMutate).not.toHaveBeenCalled()
  })
  it('distinguishes loading from disabled', () => {
    setConfig(false, { data: undefined, isLoading: true })
    renderWithProviders(<AICopilotSettings organization={mockOrganization} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading Copilot configuration')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
  it('shows an error with retry instead of activation even with cached data', async () => {
    setConfig(true, { isError: true })
    const { userEvent } = renderWithProviders(<AICopilotSettings organization={mockOrganization} />)
    expect(screen.getByText('Unable to load Copilot configuration')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(mockRefetch).toHaveBeenCalled()
  })
  it('requires acceptance before reactivation and requests read-only access', async () => {
    setConfig(false)
    const { userEvent } = renderWithProviders(<AICopilotSettings organization={mockOrganization} />)
    const enable = screen.getByRole('button', { name: 'Enable Copilot' })
    expect(enable).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(enable)
    expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ enabled: true, readOnly: true }))
  })
  it('restricts disabling to organization administrators', () => {
    mockCanManage = false
    renderWithProviders(<AICopilotSettings organization={mockOrganization} />)
    expect(screen.getByRole('button', { name: 'Disable' })).toBeDisabled()
  })
  it('restricts reactivation to organization administrators', () => {
    mockCanManage = false
    setConfig(false)
    renderWithProviders(<AICopilotSettings organization={mockOrganization} />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Enable Copilot' })).toBeDisabled()
  })
})

import { buildSkillPresetApiError } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AiFeaturesNotice } from './ai-features-notice'

const mockEnableAiFeatures = jest.fn()
const mockUpdateOrgConfig = jest.fn()
const mockAiFeaturesEnabled = jest.fn()
const mockCopilotStatus = jest.fn()

jest.mock('../hooks/use-enable-ai-features/use-enable-ai-features', () => ({
  useEnableAiFeatures: () => ({ mutateAsync: mockEnableAiFeatures }),
}))
jest.mock('../hooks/use-ai-features-enabled/use-ai-features-enabled', () => ({
  useAiFeaturesEnabled: () => mockAiFeaturesEnabled(),
}))
jest.mock('../hooks/use-copilot-status/use-copilot-status', () => ({
  useCopilotStatus: () => mockCopilotStatus(),
}))
jest.mock('@qovery/shared/devops-copilot/data-access', () => ({
  ...jest.requireActual('@qovery/shared/devops-copilot/data-access'),
  mutations: { updateOrgConfig: (...args: unknown[]) => mockUpdateOrgConfig(...args) },
}))

const copilot = (enabled: boolean) => ({ ready: true, enabled, readOnly: true, isLoading: false, error: null })

const openModal = async (onEnabled = jest.fn()) => {
  const rendered = renderWithProviders(
    <AiFeaturesNotice organizationId="organization-1" canEnable onEnabled={onEnabled} />
  )
  await rendered.userEvent.click(screen.getByRole('button', { name: 'Turn on AI' }))
  return { ...rendered, onEnabled }
}

describe('AiFeaturesNotice and the Turn on AI modal', () => {
  beforeEach(() => {
    mockEnableAiFeatures.mockReset().mockResolvedValue(undefined)
    mockUpdateOrgConfig.mockReset().mockResolvedValue({})
    mockAiFeaturesEnabled.mockReturnValue(false)
    mockCopilotStatus.mockReturnValue(copilot(false))
  })

  it('offers no button to people who cannot change the setting', () => {
    renderWithProviders(<AiFeaturesNotice organizationId="organization-1" canEnable={false} />)

    expect(screen.getByText('The Skills Registry needs AI features')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
  })

  it('turns on AI features, then the Copilot read-only, once the terms are accepted', async () => {
    const { userEvent, onEnabled } = await openModal()

    expect(screen.getByText('This turns on two things for your organization.')).toBeInTheDocument()
    expect(screen.getByText(/the organization’s opt-in to AI/)).toBeInTheDocument()
    expect(screen.getByText(/It starts read-only and acts as you/)).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeDisabled()

    await userEvent.click(screen.getByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' }))
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(mockEnableAiFeatures).toHaveBeenCalledWith({ organizationId: 'organization-1' })
    expect(mockUpdateOrgConfig).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'organization-1', enabled: true, readOnly: true })
    )
    expect(onEnabled).toHaveBeenCalled()
  })

  it('keeps AI features on when the Copilot step fails, and retries only the Copilot', async () => {
    mockUpdateOrgConfig.mockRejectedValueOnce({ response: { data: { error: 'The Copilot service did not answer' } } })
    const { userEvent, onEnabled } = await openModal()

    await userEvent.click(screen.getByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' }))
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(await screen.findByText('AI features are on, but the Copilot could not be turned on')).toBeInTheDocument()
    expect(screen.getByText(/The Copilot service did not answer. Retry turns on the Copilot only./)).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Retry')
    expect(onEnabled).not.toHaveBeenCalled()

    await userEvent.click(screen.getByTestId('submit-button'))
    expect(mockEnableAiFeatures).toHaveBeenCalledTimes(1)
    expect(mockUpdateOrgConfig).toHaveBeenCalledTimes(2)
    expect(onEnabled).toHaveBeenCalled()
  })

  it('only turns on the Copilot when AI features are already on', async () => {
    mockAiFeaturesEnabled.mockReturnValue(true)
    const { userEvent } = await openModal()

    expect(screen.getByText('AI features are already on. This turns on the Copilot.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' }))
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(mockEnableAiFeatures).not.toHaveBeenCalled()
    expect(mockUpdateOrgConfig).toHaveBeenCalledTimes(1)
  })

  it('only turns on AI features when the Copilot is already on, with no terms to accept', async () => {
    mockCopilotStatus.mockReturnValue(copilot(true))
    const { userEvent } = await openModal()

    expect(screen.getByText('The Copilot is already on. This turns on AI features.')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(mockEnableAiFeatures).toHaveBeenCalledTimes(1)
    expect(mockUpdateOrgConfig).not.toHaveBeenCalled()
  })

  it('stops with the error when AI features cannot be turned on', async () => {
    mockEnableAiFeatures.mockRejectedValue(buildSkillPresetApiError(403, 'You need to be an owner or an admin'))
    const { userEvent, onEnabled } = await openModal()

    await userEvent.click(screen.getByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' }))
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(await screen.findByText('AI features could not be turned on')).toBeInTheDocument()
    expect(screen.getByText(/You need to be an owner or an admin/)).toBeInTheDocument()
    expect(mockUpdateOrgConfig).not.toHaveBeenCalled()
    expect(onEnabled).not.toHaveBeenCalled()
  })
})

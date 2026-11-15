import { buildSkillPresetApiError } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AiFeaturesNotice } from './ai-features-notice'

const mockEnableAiFeatures = jest.fn()

jest.mock('../hooks/use-enable-ai-features/use-enable-ai-features', () => ({
  useEnableAiFeatures: () => ({ mutateAsync: mockEnableAiFeatures }),
}))

describe('AiFeaturesNotice', () => {
  beforeEach(() => mockEnableAiFeatures.mockReset())

  it('offers no button to people who cannot change the setting', () => {
    renderWithProviders(<AiFeaturesNotice organizationId="organization-1" canEnable={false} />)

    expect(screen.getByText('Skill presets need AI features')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI features' })).not.toBeInTheDocument()
  })

  it('explains what turning AI features on means, then calls the endpoint', async () => {
    mockEnableAiFeatures.mockResolvedValue(undefined)
    const onEnabled = jest.fn()
    const { userEvent } = renderWithProviders(
      <AiFeaturesNotice organizationId="organization-1" canEnable onEnabled={onEnabled} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Turn on AI features' }))
    expect(screen.getByText(/including the model review of every skill preset on AWS Bedrock/)).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(mockEnableAiFeatures).toHaveBeenCalledWith({ organizationId: 'organization-1' })
    expect(onEnabled).toHaveBeenCalled()
  })

  it('keeps the dialog open with the error when it fails', async () => {
    mockEnableAiFeatures.mockRejectedValue(buildSkillPresetApiError(403, 'You need to be an owner or an admin'))
    const onEnabled = jest.fn()
    const { userEvent } = renderWithProviders(
      <AiFeaturesNotice organizationId="organization-1" canEnable onEnabled={onEnabled} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Turn on AI features' }))
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(await screen.findByText('You need to be an owner or an admin')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(onEnabled).not.toHaveBeenCalled()
  })
})

import { LlmProviderType } from 'qovery-typescript-axios'
import { useState } from 'react'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  AgenticWorkflowModelSetting,
  getAgenticWorkflowModel,
  updateAgenticWorkflowModel,
} from './agentic-workflow-model-setting'

const mockRefetch = jest.fn()
let mockModels: Array<{ id: string; display_name: string; created_at: null }> = []
let mockIsError = false
let mockIsLoading = false

jest.mock('@qovery/domains/organizations/feature', () => ({
  useLlmProviderModels: () => ({
    data: mockModels,
    isError: mockIsError,
    isLoading: mockIsLoading,
    refetch: mockRefetch,
  }),
}))

describe('AgenticWorkflowModelSetting', () => {
  beforeEach(() => {
    mockModels = []
    mockIsError = false
    mockIsLoading = false
    mockRefetch.mockReset()
  })

  it('reads and updates the model while preserving other settings', () => {
    const settings = '{"provider":"anthropic","model":"claude-haiku"}'

    expect(getAgenticWorkflowModel(settings)).toBe('claude-haiku')
    expect(JSON.parse(updateAgenticWorkflowModel(settings, 'claude-sonnet'))).toEqual({
      provider: 'anthropic',
      model: 'claude-sonnet',
    })
  })

  it('repairs malformed settings when a model is selected', () => {
    expect(JSON.parse(updateAgenticWorkflowModel('invalid', 'claude-sonnet'))).toEqual({
      model: 'claude-sonnet',
    })
  })

  it('lists Claude models and serializes the selected model', async () => {
    mockModels = [
      { id: 'claude-sonnet', display_name: 'Claude Sonnet', created_at: null },
      { id: 'claude-haiku', display_name: 'Claude Haiku', created_at: null },
    ]
    const onChange = jest.fn()

    renderWithProviders(
      <AgenticWorkflowModelSetting
        llmProviderId="provider-1"
        providerType={LlmProviderType.CLAUDE}
        settings={'{"provider":"anthropic","model":"claude-haiku"}'}
        onChange={onChange}
      />
    )

    expect(screen.getByLabelText('Model')).toBeInTheDocument()
    expect(screen.queryByText('Bedrock settings')).not.toBeInTheDocument()
    await selectEvent.select(screen.getByLabelText('Model'), 'Claude Sonnet', {
      container: document.body,
    })

    expect(JSON.parse(onChange.mock.calls[0][0])).toEqual({ provider: 'anthropic', model: 'claude-sonnet' })
  })

  it('selects the first Claude model by default', async () => {
    mockModels = [
      { id: 'claude-opus', display_name: 'Claude Opus', created_at: null },
      { id: 'claude-sonnet', display_name: 'Claude Sonnet', created_at: null },
    ]
    const onChange = jest.fn()

    renderWithProviders(
      <AgenticWorkflowModelSetting
        llmProviderId="provider-1"
        providerType={LlmProviderType.CLAUDE}
        settings={'{"model":"eu.anthropic.claude-opus-5"}'}
        onChange={onChange}
      />
    )

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(JSON.parse(onChange.mock.calls[0][0])).toEqual({ model: 'claude-opus' })
  })

  it('selects the first model when switching tokens even if the previous model is still available', async () => {
    mockModels = [
      { id: 'claude-opus', display_name: 'Claude Opus', created_at: null },
      { id: 'claude-sonnet', display_name: 'Claude Sonnet', created_at: null },
    ]
    const onChange = jest.fn()
    function ModelSettingHarness() {
      const [llmProviderId, setLlmProviderId] = useState('provider-1')

      return (
        <>
          <button type="button" onClick={() => setLlmProviderId('provider-2')}>
            Switch token
          </button>
          <AgenticWorkflowModelSetting
            llmProviderId={llmProviderId}
            providerType={LlmProviderType.CLAUDE}
            settings={'{"model":"claude-sonnet"}'}
            onChange={onChange}
          />
        </>
      )
    }
    const { userEvent } = renderWithProviders(<ModelSettingHarness />)

    expect(onChange).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Switch token' }))

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(JSON.parse(onChange.mock.calls[0][0])).toEqual({ model: 'claude-opus' })
  })

  it('lists Bedrock models and serializes the first model', async () => {
    mockModels = [
      { id: 'eu.anthropic.claude-opus-5', display_name: 'Claude Opus 5', created_at: null },
      { id: 'us.anthropic.claude-sonnet-4', display_name: 'Claude Sonnet 4', created_at: null },
    ]
    const onChange = jest.fn()

    renderWithProviders(
      <AgenticWorkflowModelSetting
        llmProviderId="provider-1"
        providerType={LlmProviderType.BEDROCK}
        settings="{}"
        onChange={onChange}
      />
    )

    expect(screen.getByLabelText('Model')).toBeInTheDocument()
    await selectEvent.openMenu(screen.getByLabelText('Model'))
    expect(document.querySelector('img[src*="/eu.svg"]')).toBeInTheDocument()
    expect(document.querySelector('img[src*="/us.svg"]')).toBeInTheDocument()
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(JSON.parse(onChange.mock.calls[0][0])).toEqual({ model: 'eu.anthropic.claude-opus-5' })
  })

  it('repairs invalid Bedrock settings with the first available model', async () => {
    mockModels = [{ id: 'eu.anthropic.claude-opus-5', display_name: 'Claude Opus 5', created_at: null }]
    const onChange = jest.fn()

    renderWithProviders(
      <AgenticWorkflowModelSetting
        llmProviderId="provider-1"
        providerType={LlmProviderType.BEDROCK}
        settings={'{"model":'}
        onChange={onChange}
      />
    )

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(JSON.parse(onChange.mock.calls[0][0])).toEqual({ model: 'eu.anthropic.claude-opus-5' })
  })

  it('does not show model settings before a token is selected', () => {
    renderWithProviders(
      <AgenticWorkflowModelSetting
        llmProviderId=""
        providerType={LlmProviderType.CLAUDE}
        settings="{}"
        onChange={jest.fn()}
      />
    )

    expect(screen.queryByLabelText('Model')).not.toBeInTheDocument()
  })

  it('shows an error with no selected value when Claude returns no models', () => {
    renderWithProviders(
      <AgenticWorkflowModelSetting
        llmProviderId="provider-1"
        providerType={LlmProviderType.CLAUDE}
        settings={'{"model":"eu.anthropic.claude-opus-5"}'}
        onChange={jest.fn()}
      />
    )

    expect(screen.getByText('No models are available for this token.')).toBeInTheDocument()
    expect(screen.getByLabelText('Model')).toHaveValue('')
  })

  it('suggests changing the Bedrock region when no models are returned', () => {
    renderWithProviders(
      <AgenticWorkflowModelSetting
        llmProviderId="provider-1"
        providerType={LlmProviderType.BEDROCK}
        settings="{}"
        onChange={jest.fn()}
      />
    )

    expect(
      screen.getByText('No models are available in this AWS region. Select another region in the token settings.')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Model')).toHaveValue('')
  })

  it('shows loading and error states without a retry action', () => {
    mockIsError = true
    const { rerender } = renderWithProviders(
      <AgenticWorkflowModelSetting
        llmProviderId="provider-1"
        providerType={LlmProviderType.CLAUDE}
        settings="{}"
        onChange={jest.fn()}
      />
    )

    expect(screen.getByText('We couldn’t load models. Check that this token’s API key is valid.')).toBeInTheDocument()
    expect(screen.getByLabelText('Model')).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()

    mockIsError = false
    mockIsLoading = true
    rerender(
      <AgenticWorkflowModelSetting
        llmProviderId="provider-1"
        providerType={LlmProviderType.CLAUDE}
        settings="{}"
        onChange={jest.fn()}
      />
    )
    expect(screen.getByLabelText('Model')).toBeInTheDocument()
    expect(screen.queryByText('No model is available for this token.')).not.toBeInTheDocument()
  })
})

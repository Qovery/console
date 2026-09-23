import { LlmProviderType } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
        bedrockSettings={<div>Bedrock settings</div>}
        llmProviderId="provider-1"
        providerType={LlmProviderType.CLAUDE}
        settings={'{"provider":"anthropic","model":"claude-haiku"}'}
        onChange={onChange}
      />
    )

    expect(screen.getByLabelText('Model')).toBeInTheDocument()
    expect(screen.queryByText('Bedrock settings')).not.toBeInTheDocument()
    await selectEvent.select(screen.getByLabelText('Model'), 'Claude Sonnet')

    expect(JSON.parse(onChange.mock.calls[0][0])).toEqual({ provider: 'anthropic', model: 'claude-sonnet' })
  })

  it('keeps Bedrock settings visible', () => {
    renderWithProviders(
      <AgenticWorkflowModelSetting
        bedrockSettings={<div>Cloud settings JSON</div>}
        llmProviderId="provider-1"
        providerType={LlmProviderType.BEDROCK}
        settings="{}"
        onChange={jest.fn()}
      />
    )

    expect(screen.getByText('Cloud settings JSON')).toBeInTheDocument()
    expect(screen.queryByLabelText('Model')).not.toBeInTheDocument()
  })

  it('shows an empty state when Claude returns no models', () => {
    renderWithProviders(
      <AgenticWorkflowModelSetting
        bedrockSettings={<div>Bedrock settings</div>}
        llmProviderId="provider-1"
        providerType={LlmProviderType.CLAUDE}
        settings="{}"
        onChange={jest.fn()}
      />
    )

    expect(screen.getByText('No model is available for this token.')).toBeInTheDocument()
  })

  it('shows a loading state and allows retrying errors', async () => {
    mockIsError = true
    const { userEvent, rerender } = renderWithProviders(
      <AgenticWorkflowModelSetting
        bedrockSettings={<div>Bedrock settings</div>}
        llmProviderId="provider-1"
        providerType={LlmProviderType.CLAUDE}
        settings="{}"
        onChange={jest.fn()}
      />
    )

    expect(screen.getByText('Unable to load models.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(mockRefetch).toHaveBeenCalledTimes(1)

    mockIsError = false
    mockIsLoading = true
    rerender(
      <AgenticWorkflowModelSetting
        bedrockSettings={<div>Bedrock settings</div>}
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

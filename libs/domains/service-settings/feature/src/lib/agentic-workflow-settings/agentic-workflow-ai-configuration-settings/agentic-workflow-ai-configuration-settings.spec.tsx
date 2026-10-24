import {
  AgenticWorkflowModelType,
  type LlmProviderResponse,
  LlmProviderScope,
  LlmProviderType,
} from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowAiConfigurationSettings } from './agentic-workflow-ai-configuration-settings'

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ environmentId: 'environment-1', organizationId: 'organization-1' }),
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  useVariables: () => ({ data: [] }),
}))

const useLlmProviderModelsSpy = jest.spyOn(organizationsDomain, 'useLlmProviderModels') as jest.Mock

const claudeProvider: LlmProviderResponse = {
  id: 'provider-1',
  name: 'Claude token',
  type: LlmProviderType.CLAUDE,
  scope: LlmProviderScope.ORGANIZATION,
  has_credential: true,
  created_at: '2026-09-23T00:00:00Z',
  updated_at: '2026-09-23T00:00:00Z',
}

const bedrockProvider: LlmProviderResponse = {
  ...claudeProvider,
  id: 'provider-2',
  name: 'Bedrock token',
  type: LlmProviderType.BEDROCK,
  region: 'eu-west-1',
}

describe('AgenticWorkflowAiConfigurationSettings', () => {
  beforeEach(() => {
    useLlmProviderModelsSpy.mockReturnValue({ data: [], isError: false, isLoading: false, refetch: jest.fn() })
  })

  it('renders the token, model settings, and instructions', () => {
    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness>
        {(form) => <AgenticWorkflowAiConfigurationSettings form={form} llmProviders={[]} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByLabelText('Token')).toBeInTheDocument()
    expect(screen.queryByLabelText('API key')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Model')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Instructions' })).not.toBeInTheDocument()
    const instructions = screen.getByRole('textbox', { name: 'Instructions' })
    expect(instructions).toBeInTheDocument()
    expect(instructions).toHaveAttribute('aria-invalid', 'false')
  })

  it('does not show an instructions error before the field is modified', () => {
    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ agentPrompt: '' }}>
        {(form) => <AgenticWorkflowAiConfigurationSettings form={form} llmProviders={[]} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByText('Please enter instructions.')).not.toBeInTheDocument()
  })

  it('shows the model selector instead of cloud settings for Claude', () => {
    useLlmProviderModelsSpy.mockReturnValue({
      data: [{ id: 'claude-sonnet', display_name: 'Claude Sonnet', created_at: null }],
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    })

    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness
        values={{ llmProviderId: claudeProvider.id, modelSettings: '{"model":"claude-sonnet"}' }}
      >
        {(form) => <AgenticWorkflowAiConfigurationSettings form={form} llmProviders={[claudeProvider]} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByLabelText('Model')).toBeInTheDocument()
    expect(screen.queryByText('Cloud settings JSON')).not.toBeInTheDocument()
  })

  it('hides the model selector until the model type is resolved', () => {
    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ llmProviderId: claudeProvider.id, modelType: undefined }}>
        {(form) => <AgenticWorkflowAiConfigurationSettings form={form} llmProviders={[claudeProvider]} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.queryByLabelText('Model')).not.toBeInTheDocument()
  })

  it('shows the model selector for Bedrock', () => {
    useLlmProviderModelsSpy.mockReturnValue({
      data: [{ id: 'anthropic.claude-opus-5', display_name: 'Claude Opus 5', created_at: null }],
      isError: false,
      isLoading: false,
    })

    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness
        values={{
          llmProviderId: bedrockProvider.id,
          modelType: AgenticWorkflowModelType.BEDROCK,
          modelSettings: '{"model":"anthropic.claude-opus-5"}',
        }}
      >
        {(form) => <AgenticWorkflowAiConfigurationSettings form={form} llmProviders={[bedrockProvider]} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByLabelText('Model')).toBeInTheDocument()
    expect(document.querySelector('[data-testid="selected-icon"] img[src*="/eu.svg"]')).toBeInTheDocument()
    expect(screen.queryByText('Cloud settings JSON')).not.toBeInTheDocument()
  })

  it.each([
    [LlmProviderType.ANTHROPIC_COMPATIBLE, 'Gateway token', AgenticWorkflowModelType.CLAUDE],
    [LlmProviderType.BEDROCK, 'Bedrock token', AgenticWorkflowModelType.BEDROCK],
    [LlmProviderType.CLAUDE, 'Claude token', AgenticWorkflowModelType.CLAUDE],
  ])('sets the workflow model type for a %s token', async (_, tokenName, expectedModelType) => {
    const gatewayProvider: LlmProviderResponse = {
      ...claudeProvider,
      id: 'provider-3',
      name: 'Gateway token',
      type: LlmProviderType.ANTHROPIC_COMPATIBLE,
      base_url: 'https://gateway.example.com/anthropic',
    }
    // Start from the opposite model type so a missing update is visible.
    const initialModelType =
      expectedModelType === AgenticWorkflowModelType.CLAUDE
        ? AgenticWorkflowModelType.BEDROCK
        : AgenticWorkflowModelType.CLAUDE

    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ modelType: initialModelType }}>
        {(form) => (
          <>
            <AgenticWorkflowAiConfigurationSettings
              form={form}
              llmProviders={[claudeProvider, bedrockProvider, gatewayProvider]}
            />
            <output aria-label="Workflow model type">{form.watch('modelType')}</output>
          </>
        )}
      </AgenticWorkflowSettingsFormHarness>
    )

    await selectEvent.select(screen.getByLabelText('Token'), tokenName, { container: document.body })

    expect(screen.getByLabelText('Workflow model type')).toHaveTextContent(expectedModelType)
  })
})

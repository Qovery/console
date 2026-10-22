import { LlmProviderScope, LlmProviderType } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useCreateLlmProviderHook from '../hooks/use-create-llm-provider/use-create-llm-provider'
import * as useEditLlmProviderHook from '../hooks/use-edit-llm-provider/use-edit-llm-provider'
import { LlmProviderCreateEditModal } from './llm-provider-create-edit-modal'

const useCreateLlmProviderMock = jest.spyOn(useCreateLlmProviderHook, 'useCreateLlmProvider') as jest.Mock
const useEditLlmProviderMock = jest.spyOn(useEditLlmProviderHook, 'useEditLlmProvider') as jest.Mock
const useCloudProvidersMock = jest.spyOn(cloudProvidersDomain, 'useCloudProviders') as jest.Mock
const createLlmProvider = jest.fn()
const editLlmProvider = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

describe('LlmProviderCreateEditModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createLlmProvider.mockResolvedValue({ id: 'provider-1' })
    editLlmProvider.mockResolvedValue({ id: 'provider-1' })
    useCreateLlmProviderMock.mockReturnValue({ mutateAsync: createLlmProvider, isLoading: false })
    useEditLlmProviderMock.mockReturnValue({ mutateAsync: editLlmProvider, isLoading: false })
    useCloudProvidersMock.mockReturnValue({
      data: [
        {
          short_name: 'AWS',
          regions: [
            { name: 'eu-west-1', city: 'Dublin', country_code: 'IE' },
            { name: 'eu-west-2', city: 'London', country_code: 'GB' },
            { name: 'us-east-2', city: 'Ohio', country_code: 'US' },
            { name: 'af-south-1', city: 'Cape Town', country_code: 'ZA' },
            { name: 'ap-east-1', city: 'Hong Kong', country_code: 'HK' },
            { name: 'ap-south-1', city: 'Mumbai', country_code: 'IN' },
            { name: 'ap-northeast-1', city: 'Tokyo', country_code: 'JP' },
          ],
        },
        { short_name: 'GCP', regions: [{ name: 'europe-west1', city: 'Belgium' }] },
      ],
      isError: false,
      isLoading: false,
    })
  })

  it('should create a personal Claude token', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={onClose} />)

    await userEvent.type(screen.getByLabelText('Name'), ' My Claude ')
    await userEvent.type(screen.getByLabelText('Token'), ' sk-ant-secret ')
    await userEvent.click(screen.getByRole('button', { name: 'Add token' }))

    await waitFor(() =>
      expect(createLlmProvider).toHaveBeenCalledWith({
        organizationId: 'org-1',
        llmProviderRequest: {
          name: 'My Claude',
          description: undefined,
          type: LlmProviderType.CLAUDE,
          credential: 'sk-ant-secret',
          scope: LlmProviderScope.USER,
        },
      })
    )
    expect(onClose).toHaveBeenCalledWith({ id: 'provider-1' })
  })

  it('should reject a whitespace-only token', async () => {
    const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

    await userEvent.type(screen.getByLabelText('Name'), 'My Claude')
    await userEvent.type(screen.getByLabelText('Token'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Add token' }))

    expect(await screen.findByText('Please enter a token.')).toBeInTheDocument()
    expect(createLlmProvider).not.toHaveBeenCalled()
  })

  it('should keep the stored token when editing with a blank value', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(
      <LlmProviderCreateEditModal
        onClose={onClose}
        llmProvider={{
          id: 'provider-1',
          name: 'Claude',
          description: '',
          type: LlmProviderType.CLAUDE,
          has_credential: true,
          scope: LlmProviderScope.USER,
          created_at: '2026-09-15T10:00:00Z',
          updated_at: '2026-09-15T10:00:00Z',
        }}
      />
    )

    expect(screen.queryByLabelText('Scope')).not.toBeInTheDocument()
    expect(screen.getByText('Leave blank to keep the current token.')).toBeInTheDocument()
    const saveButton = screen.getByRole('button', { name: 'Save token' })
    await waitFor(() => expect(saveButton).toBeEnabled())
    await userEvent.click(saveButton)

    await waitFor(() =>
      expect(editLlmProvider).toHaveBeenCalledWith({
        organizationId: 'org-1',
        llmProviderId: 'provider-1',
        llmProviderRequest: {
          name: 'Claude',
          description: undefined,
          type: LlmProviderType.CLAUDE,
          credential: undefined,
          scope: undefined,
        },
      })
    )
    await waitFor(() => expect(onClose).toHaveBeenCalledWith({ id: 'provider-1' }))
  })

  it('should select Claude by default and allow choosing another provider', () => {
    const { container } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

    expect(container.querySelector('img[src="/assets/ai-tools/claude.svg"]')).toBeInTheDocument()
    expect(screen.getByLabelText('Provider')).toBeEnabled()
    expect(screen.getByText('Anthropic Claude')).toBeInTheDocument()
  })

  it('should create an Amazon Bedrock token with its region', async () => {
    const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

    await selectEvent.select(screen.getByLabelText('Provider'), 'Amazon Bedrock')
    expect(document.querySelector('[data-testid="selected-icon"] img[src*="/ie.svg"]')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Name'), 'EU Bedrock')
    await userEvent.type(screen.getByLabelText('Token'), 'aws-credentials')
    await selectEvent.select(screen.getByLabelText('AWS region'), 'London (eu-west-2)', {
      container: document.body,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Add token' }))

    await waitFor(() =>
      expect(createLlmProvider).toHaveBeenCalledWith({
        organizationId: 'org-1',
        llmProviderRequest: {
          name: 'EU Bedrock',
          description: undefined,
          type: LlmProviderType.BEDROCK,
          credential: 'aws-credentials',
          region: 'eu-west-2',
          scope: LlmProviderScope.USER,
        },
      })
    )
  })

  it('shows the country flag for every AWS region option', async () => {
    renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

    await selectEvent.select(screen.getByLabelText('Provider'), 'Amazon Bedrock')
    await selectEvent.openMenu(screen.getByLabelText('AWS region'))

    for (const code of ['ie', 'gb', 'us', 'za', 'hk', 'in', 'jp']) {
      expect(document.querySelector(`img[src$="/${code}.svg"]`)).toBeInTheDocument()
    }
  })

  it('should select eu-west-1 as the default AWS region', async () => {
    const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

    await selectEvent.select(screen.getByLabelText('Provider'), 'Amazon Bedrock')
    expect(screen.getByText('Dublin (eu-west-1)')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Name'), 'Default Bedrock')
    await userEvent.type(screen.getByLabelText('Token'), 'aws-credentials')
    await userEvent.click(screen.getByRole('button', { name: 'Add token' }))

    await waitFor(() =>
      expect(createLlmProvider).toHaveBeenCalledWith({
        organizationId: 'org-1',
        llmProviderRequest: {
          name: 'Default Bedrock',
          description: undefined,
          type: LlmProviderType.BEDROCK,
          credential: 'aws-credentials',
          region: 'eu-west-1',
          scope: LlmProviderScope.USER,
        },
      })
    )
  })

  it('keeps an existing Bedrock region visible when it is absent from the cluster region list', async () => {
    renderWithProviders(
      <LlmProviderCreateEditModal
        onClose={jest.fn()}
        llmProvider={{
          id: 'provider-1',
          name: 'Bedrock',
          type: LlmProviderType.BEDROCK,
          region: 'us-east-1',
          has_credential: true,
          scope: LlmProviderScope.USER,
          created_at: '2026-09-15T10:00:00Z',
          updated_at: '2026-09-15T10:00:00Z',
        }}
      />
    )

    expect(screen.getByText('us-east-1')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save token' })).toBeEnabled())
  })

  it('preserves an empty region when saving an existing Bedrock token', async () => {
    const { userEvent } = renderWithProviders(
      <LlmProviderCreateEditModal
        onClose={jest.fn()}
        llmProvider={{
          id: 'provider-1',
          name: 'Bedrock',
          type: LlmProviderType.BEDROCK,
          region: null,
          has_credential: true,
          scope: LlmProviderScope.USER,
          created_at: '2026-09-15T10:00:00Z',
          updated_at: '2026-09-15T10:00:00Z',
        }}
      />
    )

    expect(screen.getByLabelText('AWS region')).toHaveValue('')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save token' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Save token' }))

    await waitFor(() =>
      expect(editLlmProvider).toHaveBeenCalledWith({
        organizationId: 'org-1',
        llmProviderId: 'provider-1',
        llmProviderRequest: {
          name: 'Bedrock',
          description: undefined,
          type: LlmProviderType.BEDROCK,
          credential: undefined,
          region: null,
          scope: undefined,
        },
      })
    )
  })

  describe('Anthropic-compatible provider', () => {
    const compatibleProvider = {
      id: 'provider-1',
      name: 'Gateway',
      description: '',
      type: LlmProviderType.ANTHROPIC_COMPATIBLE,
      base_url: 'https://gateway.example.com/anthropic',
      has_credential: true,
      scope: LlmProviderScope.ORGANIZATION,
      created_at: '2026-09-15T10:00:00Z',
      updated_at: '2026-09-15T10:00:00Z',
    }

    it('should create a token with a base URL that has a path prefix and a port', async () => {
      const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

      await selectEvent.select(screen.getByLabelText('Provider'), 'Anthropic-compatible')
      expect(screen.queryByLabelText('AWS region')).not.toBeInTheDocument()
      expect(document.querySelector('i.fa-plug')).toBeInTheDocument()
      expect(document.querySelector('img[src="/assets/ai-tools/claude.svg"]')).not.toBeInTheDocument()
      await userEvent.type(screen.getByLabelText('Name'), 'Gateway')
      await userEvent.type(screen.getByLabelText('Token'), 'gateway-token')
      await userEvent.type(screen.getByLabelText('Base URL'), ' https://gateway.example.com:8443/anthropic/v1 ')
      await userEvent.click(screen.getByRole('button', { name: 'Add token' }))

      await waitFor(() =>
        expect(createLlmProvider).toHaveBeenCalledWith({
          organizationId: 'org-1',
          llmProviderRequest: {
            name: 'Gateway',
            description: undefined,
            type: LlmProviderType.ANTHROPIC_COMPATIBLE,
            credential: 'gateway-token',
            base_url: 'https://gateway.example.com:8443/anthropic/v1',
            scope: LlmProviderScope.USER,
          },
        })
      )
    })

    it('should require a base URL', async () => {
      const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

      await selectEvent.select(screen.getByLabelText('Provider'), 'Anthropic-compatible')
      await userEvent.type(screen.getByLabelText('Name'), 'Gateway')
      await userEvent.type(screen.getByLabelText('Token'), 'gateway-token')
      await userEvent.type(screen.getByLabelText('Base URL'), 'h')
      await userEvent.clear(screen.getByLabelText('Base URL'))

      expect(await screen.findByText('Please enter a base URL.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add token' })).toBeDisabled()
      expect(createLlmProvider).not.toHaveBeenCalled()
    })

    it.each([
      ['a non-HTTP scheme', 'ftp://gateway.example.com'],
      ['a missing scheme', 'gateway.example.com/anthropic'],
      ['user info', 'https://user:secret@gateway.example.com'],
      ['a query', 'https://gateway.example.com/anthropic?key=1'],
      ['a fragment', 'https://gateway.example.com/anthropic#top'],
      ['port 0', 'https://gateway.example.com:0'],
    ])('should reject a base URL with %s', async (_, baseUrl) => {
      const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

      await selectEvent.select(screen.getByLabelText('Provider'), 'Anthropic-compatible')
      await userEvent.type(screen.getByLabelText('Name'), 'Gateway')
      await userEvent.type(screen.getByLabelText('Token'), 'gateway-token')
      await userEvent.type(screen.getByLabelText('Base URL'), baseUrl)

      expect(
        await screen.findByText('Enter an HTTP or HTTPS URL without credentials, query or fragment.')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add token' })).toBeDisabled()
      expect(createLlmProvider).not.toHaveBeenCalled()
    })

    it('should prefill the saved base URL and resend it when the token is left blank', async () => {
      const { userEvent } = renderWithProviders(
        <LlmProviderCreateEditModal onClose={jest.fn()} llmProvider={compatibleProvider} />
      )

      expect(screen.getByLabelText('Base URL')).toHaveValue('https://gateway.example.com/anthropic')
      expect(screen.getByText('Leave blank to keep the current token.')).toBeInTheDocument()
      expect(screen.queryByLabelText('Scope')).not.toBeInTheDocument()
      const saveButton = screen.getByRole('button', { name: 'Save token' })
      await waitFor(() => expect(saveButton).toBeEnabled())
      await userEvent.click(saveButton)

      await waitFor(() =>
        expect(editLlmProvider).toHaveBeenCalledWith({
          organizationId: 'org-1',
          llmProviderId: 'provider-1',
          llmProviderRequest: {
            name: 'Gateway',
            description: undefined,
            type: LlmProviderType.ANTHROPIC_COMPATIBLE,
            credential: undefined,
            base_url: 'https://gateway.example.com/anthropic',
            scope: undefined,
          },
        })
      )
    })

    it('should send an edited base URL together with a rotated token', async () => {
      const { userEvent } = renderWithProviders(
        <LlmProviderCreateEditModal onClose={jest.fn()} llmProvider={compatibleProvider} />
      )

      await userEvent.clear(screen.getByLabelText('Base URL'))
      await userEvent.type(screen.getByLabelText('Base URL'), 'http://localhost:4000')
      await userEvent.type(screen.getByLabelText('Token (optional)'), 'rotated-token')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Save token' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Save token' }))

      await waitFor(() =>
        expect(editLlmProvider).toHaveBeenCalledWith({
          organizationId: 'org-1',
          llmProviderId: 'provider-1',
          llmProviderRequest: expect.objectContaining({
            credential: 'rotated-token',
            base_url: 'http://localhost:4000',
          }),
        })
      )
    })

    it('should omit the base URL and require a new token when switching to Claude', async () => {
      const { userEvent } = renderWithProviders(
        <LlmProviderCreateEditModal onClose={jest.fn()} llmProvider={compatibleProvider} />
      )

      await selectEvent.select(screen.getByLabelText('Provider'), 'Anthropic Claude')
      expect(screen.queryByLabelText('Base URL')).not.toBeInTheDocument()
      await userEvent.type(screen.getByLabelText('Token'), 'sk-ant-secret')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Save token' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Save token' }))

      await waitFor(() => expect(editLlmProvider).toHaveBeenCalledTimes(1))
      const { llmProviderRequest } = editLlmProvider.mock.calls[0][0]
      expect(llmProviderRequest).toEqual({
        name: 'Gateway',
        description: undefined,
        type: LlmProviderType.CLAUDE,
        credential: 'sk-ant-secret',
        scope: undefined,
      })
      expect(llmProviderRequest).not.toHaveProperty('base_url')
    })

    it('should ask for a base URL when an existing Claude token switches to Anthropic-compatible', async () => {
      const { userEvent } = renderWithProviders(
        <LlmProviderCreateEditModal
          onClose={jest.fn()}
          llmProvider={{ ...compatibleProvider, type: LlmProviderType.CLAUDE, base_url: null }}
        />
      )

      await selectEvent.select(screen.getByLabelText('Provider'), 'Anthropic-compatible')
      expect(screen.getByLabelText('Base URL')).toHaveValue('')
      await userEvent.type(screen.getByLabelText('Token'), 'gateway-token')
      await userEvent.type(screen.getByLabelText('Base URL'), 'https://gateway.example.com')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Save token' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Save token' }))

      await waitFor(() =>
        expect(editLlmProvider).toHaveBeenCalledWith({
          organizationId: 'org-1',
          llmProviderId: 'provider-1',
          llmProviderRequest: expect.objectContaining({
            type: LlmProviderType.ANTHROPIC_COMPATIBLE,
            credential: 'gateway-token',
            base_url: 'https://gateway.example.com',
          }),
        })
      )
    })
  })
})

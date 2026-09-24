import { LlmProviderScope, LlmProviderType } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useCreateLlmProviderHook from '../hooks/use-create-llm-provider/use-create-llm-provider'
import * as useEditLlmProviderHook from '../hooks/use-edit-llm-provider/use-edit-llm-provider'
import { LlmProviderCreateEditModal } from './llm-provider-create-edit-modal'

const useCreateLlmProviderMock = jest.spyOn(useCreateLlmProviderHook, 'useCreateLlmProvider') as jest.Mock
const useEditLlmProviderMock = jest.spyOn(useEditLlmProviderHook, 'useEditLlmProvider') as jest.Mock
const createLlmProvider = jest.fn()
const editLlmProvider = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

describe('LlmProviderCreateEditModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    createLlmProvider.mockResolvedValue({ id: 'provider-1' })
    editLlmProvider.mockResolvedValue({ id: 'provider-1' })
    useCreateLlmProviderMock.mockReturnValue({ mutateAsync: createLlmProvider, isLoading: false })
    useEditLlmProviderMock.mockReturnValue({ mutateAsync: editLlmProvider, isLoading: false })
  })

  afterEach(() => {
    jest.useRealTimers()
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
    const { userEvent } = renderWithProviders(
      <LlmProviderCreateEditModal
        onClose={jest.fn()}
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
    await userEvent.type(screen.getByLabelText('Name'), 'EU Bedrock')
    await userEvent.type(screen.getByLabelText('Token'), 'aws-credentials')
    await userEvent.clear(screen.getByLabelText('AWS region'))
    await userEvent.type(screen.getByLabelText('AWS region'), 'eu-west-2')
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

  it('should select eu-west-1 as the default AWS region', async () => {
    const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

    await selectEvent.select(screen.getByLabelText('Provider'), 'Amazon Bedrock')
    expect(screen.getByLabelText('AWS region')).toHaveValue('eu-west-1')
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

  it('should reject an invalid AWS region', async () => {
    const { userEvent } = renderWithProviders(<LlmProviderCreateEditModal onClose={jest.fn()} />)

    await selectEvent.select(screen.getByLabelText('Provider'), 'Amazon Bedrock')
    await userEvent.clear(screen.getByLabelText('AWS region'))
    await userEvent.type(screen.getByLabelText('AWS region'), 'europe')
    await userEvent.click(screen.getByRole('button', { name: 'Add token' }))

    expect(await screen.findByText('Please enter a valid AWS region.')).toBeInTheDocument()
    expect(createLlmProvider).not.toHaveBeenCalled()
  })
})

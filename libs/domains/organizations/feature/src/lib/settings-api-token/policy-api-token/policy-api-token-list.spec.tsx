import { type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PolicyApiTokenList } from './policy-api-token-list'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

// Monaco does not run under jsdom; the policy is asserted through the value handed to the editor.
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  CodeEditor: ({ value }: { value?: string }) => <div data-testid="code-editor">{value}</div>,
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}))

const policyApiToken = {
  id: 'policy-token-1',
  name: 'read-only-policy',
  description: 'a demo policy',
  opa_policy: 'default allow := false\n\nallow if {\n  input.request.method == "GET"\n}\n',
  creator_name: 'someone@qovery.com',
  created_at: '2026-08-05T12:00:00Z',
} as OrganizationPolicyApiToken

describe('PolicyApiTokenList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render an empty state', () => {
    renderWithProviders(<PolicyApiTokenList policyApiTokens={[]} onDelete={jest.fn()} />)

    expect(screen.getByText(/No Policy API Token found/i)).toBeInTheDocument()
  })

  it('should render a row per token', () => {
    renderWithProviders(<PolicyApiTokenList policyApiTokens={[policyApiToken]} onDelete={jest.fn()} />)

    expect(screen.getByTestId(`policy-token-list-${policyApiToken.id}`)).toBeInTheDocument()
    expect(screen.getByText('read-only-policy')).toBeInTheDocument()
  })

  it('should show the rego policy in a modal, not inline', async () => {
    const { userEvent } = renderWithProviders(
      <PolicyApiTokenList policyApiTokens={[policyApiToken]} onDelete={jest.fn()} />
    )

    // The policy is no longer rendered in the row itself.
    expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('inspect-policy'))

    expect(mockOpenModal).toHaveBeenCalledTimes(1)

    const [{ content }] = mockOpenModal.mock.calls[0]
    const { getByTestId } = renderWithProviders(content)

    expect(getByTestId('code-editor')).toHaveTextContent('input.request.method')
  })

  it('should label the inspect button for screen readers', () => {
    renderWithProviders(<PolicyApiTokenList policyApiTokens={[policyApiToken]} onDelete={jest.fn()} />)

    expect(screen.getByRole('button', { name: /inspect policy of read-only-policy/i })).toBeInTheDocument()
  })

  it('should call onDelete with the token', async () => {
    const onDelete = jest.fn()
    const { userEvent } = renderWithProviders(
      <PolicyApiTokenList policyApiTokens={[policyApiToken]} onDelete={onDelete} />
    )

    await userEvent.click(screen.getByTestId('delete-policy-token'))

    expect(onDelete).toHaveBeenCalledWith(policyApiToken)
  })
})

import { type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { useState } from 'react'
import { dateUTCString } from '@qovery/shared/util-dates'
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
  role_id: 'role-1',
  role_name: 'devops',
  creator_name: 'someone@qovery.com',
  created_at: '2026-08-05T12:00:00Z',
} as OrganizationPolicyApiToken

describe('PolicyApiTokenList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should show last usage next to creation, relative to when the list loaded', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-13T12:00:00Z'))
    const lastUsedAt = '2026-10-13T11:55:00Z'
    const tokens = [{ ...policyApiToken, last_used_at: lastUsedAt }]
    const onDelete = jest.fn()

    function TestPage() {
      const [renderCount, setRenderCount] = useState(0)
      return (
        <>
          <button onClick={() => setRenderCount(renderCount + 1)}>Render {renderCount}</button>
          <PolicyApiTokenList policyApiTokens={tokens} onDelete={onDelete} />
        </>
      )
    }

    const { userEvent } = renderWithProviders(<TestPage />)

    const lastUsed = screen.getByText('Last used 5 minutes ago')
    expect(lastUsed).toHaveAttribute('title', dateUTCString(lastUsedAt))
    expect(lastUsed.previousElementSibling).toHaveTextContent('Created since')

    jest.setSystemTime(new Date('2026-10-13T13:00:00Z'))
    await userEvent.click(screen.getByRole('button', { name: 'Render 0' }))

    expect(screen.getByRole('button', { name: 'Render 1' })).toBeInTheDocument()
    expect(screen.getByText('Last used 5 minutes ago')).toBeInTheDocument()
  })

  it.each([null, undefined])('should hide last usage when the timestamp is %s', (lastUsedAt) => {
    renderWithProviders(
      <PolicyApiTokenList policyApiTokens={[{ ...policyApiToken, last_used_at: lastUsedAt }]} onDelete={jest.fn()} />
    )

    expect(screen.getByTestId(`policy-token-list-${policyApiToken.id}`)).toBeInTheDocument()
    expect(screen.queryByText(/Last used/)).not.toBeInTheDocument()
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

  it('should show the role on the row', () => {
    renderWithProviders(<PolicyApiTokenList policyApiTokens={[policyApiToken]} onDelete={jest.fn()} />)

    expect(screen.getByText('Role: Devops')).toBeInTheDocument()
  })

  it('should show the role read-only in the policy modal', async () => {
    // The role is fixed at creation, so it is shown but not editable: it bounds what a request the
    // policy has allowed may then do, which is not readable from the policy alone.
    const { userEvent } = renderWithProviders(
      <PolicyApiTokenList policyApiTokens={[policyApiToken]} onDelete={jest.fn()} />
    )

    await userEvent.click(screen.getByTestId('inspect-policy'))

    const [{ content }] = mockOpenModal.mock.calls[0]
    const { getByLabelText } = renderWithProviders(content)

    const role = getByLabelText(/role/i)
    expect(role).toHaveValue('Devops')
    expect(role).toBeDisabled()
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

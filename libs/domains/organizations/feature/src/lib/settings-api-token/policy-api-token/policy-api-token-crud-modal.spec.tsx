import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useCreatePolicyApiTokenModule from '../../hooks/use-create-policy-api-token/use-create-policy-api-token'
import { PolicyApiTokenCrudModal, type PolicyApiTokenCrudModalProps } from './policy-api-token-crud-modal'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockEnableAlertClickOutside = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  CodeEditor: ({ value }: { value?: string }) => <div data-testid="code-editor">{value}</div>,
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
    enableAlertClickOutside: mockEnableAlertClickOutside,
  }),
}))

const useCreatePolicyApiTokenMockSpy = jest.spyOn(useCreatePolicyApiTokenModule, 'useCreatePolicyApiToken') as jest.Mock

const createPolicyApiTokenMock = jest.fn()

let props: PolicyApiTokenCrudModalProps

describe('PolicyApiTokenCrudModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    props = {
      onClose: jest.fn(),
      organizationId: '1',
    }
    useCreatePolicyApiTokenMockSpy.mockReturnValue({
      mutateAsync: createPolicyApiTokenMock,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PolicyApiTokenCrudModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit the name, description and policy', async () => {
    const { userEvent } = renderWithProviders(<PolicyApiTokenCrudModal {...props} />)

    await userEvent.type(screen.getByRole('textbox', { name: /token name/i }), 'my-agent')
    await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'a description')

    await userEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(createPolicyApiTokenMock).toHaveBeenCalledWith({
        organizationId: '1',
        policyApiTokenCreateRequest: expect.objectContaining({
          name: 'my-agent',
          description: 'a description',
        }),
      })
    })
  })

  it('should show the token once created', async () => {
    createPolicyApiTokenMock.mockResolvedValueOnce({ token: 'sk-qov-01-abc-123' })

    const { userEvent } = renderWithProviders(<PolicyApiTokenCrudModal {...props} />)

    await userEvent.type(screen.getByRole('textbox', { name: /token name/i }), 'my-agent')
    await userEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => expect(mockOpenModal).toHaveBeenCalled())

    const [{ content }] = mockOpenModal.mock.calls[0]
    const { getByDisplayValue } = renderWithProviders(content)

    expect(getByDisplayValue('sk-qov-01-abc-123')).toBeInTheDocument()
  })

  it('should clear the dirty-form guard before showing the token', async () => {
    // The guard lives in the modal context and is shared by every modal, so if the form leaves it
    // on, the token modal inherits it and its close button offers to discard changes that were
    // already saved.
    createPolicyApiTokenMock.mockResolvedValueOnce({ token: 'sk-qov-01-abc-123' })

    const { userEvent } = renderWithProviders(<PolicyApiTokenCrudModal {...props} />)

    // Typing is what makes the form dirty and turns the guard on in the first place.
    await userEvent.type(screen.getByRole('textbox', { name: /token name/i }), 'my-agent')
    await userEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => expect(mockOpenModal).toHaveBeenCalled())

    expect(mockEnableAlertClickOutside).toHaveBeenLastCalledWith(false)

    const guardTurnedOffAt = mockEnableAlertClickOutside.mock.invocationCallOrder.at(-1) ?? 0
    expect(guardTurnedOffAt).toBeLessThan(mockOpenModal.mock.invocationCallOrder[0])
  })
})

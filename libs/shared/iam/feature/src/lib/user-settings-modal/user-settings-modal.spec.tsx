import * as Dialog from '@radix-ui/react-dialog'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { UserSettingsModal, type UserSettingsModalProps } from './user-settings-modal'

const mockUser = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  communication_email: 'john@example.com',
  profile_picture_url: 'https://example.com/avatar.png',
}

const mockUserToken = {
  sub: 'github|123',
  email: 'john@github.com',
}

const mockMutateAsync = jest.fn()

jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({ user: mockUserToken }),
}))

jest.mock('../use-user-account/use-user-account', () => ({
  useUserAccount: () => ({ data: mockUser }),
}))

jest.mock('../use-user-edit-account/use-user-edit-account', () => ({
  useEditUserAccount: () => ({
    mutateAsync: mockMutateAsync,
    isLoading: false,
  }),
}))

describe('UserSettingsModal', () => {
  const renderUserSettingsModal = (props?: UserSettingsModalProps) =>
    renderWithProviders(
      <Dialog.Root open>
        <Dialog.Content>
          <UserSettingsModal {...props} />
        </Dialog.Content>
      </Dialog.Root>
    )

  beforeEach(() => {
    localStorage.clear()
    document.cookie = 'qovery-console-preference=; Max-Age=0; Path=/'
    mockMutateAsync.mockResolvedValue(undefined)
  })

  it('should render user info and form fields', async () => {
    renderUserSettingsModal()
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled())

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toHaveValue('John')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe')
    expect(screen.getByLabelText(/communication email/i)).toHaveValue('john@example.com')
    expect(screen.getByLabelText(/account email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument()
    expect(screen.queryByText('Use legacy interface')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('should render the console preference toggle when enabled', async () => {
    document.cookie = 'qovery-console-preference=new; Path=/'

    renderUserSettingsModal({ showConsolePreferenceToggle: true })
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled())

    expect(screen.getByText('Use legacy interface')).toBeInTheDocument()
    expect(screen.getByText(/redirected to the legacy console interface/i)).toBeInTheDocument()
  })

  it('should update the console preference from the toggle', async () => {
    document.cookie = 'qovery-console-preference=new; Path=/'
    const { userEvent } = renderUserSettingsModal({ showConsolePreferenceToggle: true })
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled())

    await userEvent.click(screen.getByText('Use legacy interface'))

    // Preference is now persisted in the shared cookie only (localStorage is not origin-safe
    // across `console.qovery.com` and `new-console.qovery.com`).
    expect(document.cookie).toContain('qovery-console-preference=legacy')
  })

  it('should call mutateAsync with updated email on submit', async () => {
    const { userEvent } = renderUserSettingsModal()
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled())
    const emailInput = screen.getByLabelText(/communication email/i)
    const saveButton = screen.getByRole('button', { name: /save/i })

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'new-email@example.com')
    await userEvent.click(saveButton)

    expect(mockMutateAsync).toHaveBeenCalledWith({
      ...mockUser,
      communication_email: 'new-email@example.com',
    })
  })

  it('should show validation error for invalid email', async () => {
    const { userEvent } = renderUserSettingsModal()
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled())
    const emailInput = screen.getByLabelText(/communication email/i)

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'invalid-email')

    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
  })

  it('should disable Save button when form is invalid', async () => {
    const { userEvent } = renderUserSettingsModal()
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled())
    const emailInput = screen.getByLabelText(/communication email/i)
    const saveButton = screen.getByRole('button', { name: /save/i })

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'invalid')

    expect(saveButton).toBeDisabled()
  })
})

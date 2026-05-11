import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useCreateInviteMemberHook from '../../hooks/use-create-invite-member/use-create-invite-member'
import CreateModal, { type CreateModalProps } from './create-modal'

const useCreateInviteMemberMock = jest.spyOn(useCreateInviteMemberHook, 'useCreateInviteMember') as jest.Mock

describe('CreateModal', () => {
  const createInviteMemberMock = jest.fn()

  const props: CreateModalProps = {
    availableRoles: [
      {
        id: 'role-admin',
        name: 'Admin',
      },
      {
        id: 'role-viewer',
        name: 'Viewer',
      },
    ],
    onClose: jest.fn(),
    organizationId: 'org-1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useCreateInviteMemberMock.mockReturnValue({
      mutateAsync: createInviteMemberMock,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CreateModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    createInviteMemberMock.mockResolvedValueOnce(undefined)

    const { userEvent } = renderWithProviders(<CreateModal {...props} />)

    await userEvent.type(screen.getByTestId('input-email'), 'test@qovery.com')
    const submitButton = screen.getByTestId('submit-button')

    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(createInviteMemberMock).toHaveBeenCalledWith({
        organizationId: 'org-1',
        inviteMemberRequest: {
          email: 'test@qovery.com',
          role_id: 'role-admin',
        },
      })
      expect(props.onClose).toHaveBeenCalled()
    })
  })
})

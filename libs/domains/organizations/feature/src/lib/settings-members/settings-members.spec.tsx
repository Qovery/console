import { useAuth0 } from '@auth0/auth0-react'
import { type ReactNode } from 'react'
import { inviteMembersMock, membersMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useAvailableRolesHook from '../hooks/use-available-roles/use-available-roles'
import * as useCreateInviteMemberHook from '../hooks/use-create-invite-member/use-create-invite-member'
import * as useDeleteInviteMemberHook from '../hooks/use-delete-invite-member/use-delete-invite-member'
import * as useDeleteMemberHook from '../hooks/use-delete-member/use-delete-member'
import * as useEditMemberRoleHook from '../hooks/use-edit-member-role/use-edit-member-role'
import * as useInviteMembersHook from '../hooks/use-invite-members/use-invite-members'
import * as useMembersHook from '../hooks/use-members/use-members'
import * as useTransferOwnershipMemberRoleHook from '../hooks/use-transfer-ownership-member-role/use-transfer-ownership-member-role'
import CreateModal from './create-modal/create-modal'
import { SettingsMembers } from './settings-members'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    useModal: () => ({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    }),
    useModalConfirmation: () => ({
      openModalConfirmation: mockOpenModalConfirmation,
    }),
  }
})

const mockUser = { sub: 'owner-id' }

jest.mock('@auth0/auth0-react', () => ({
  ...jest.requireActual('@auth0/auth0-react'),
  Auth0Provider: ({ children }: { children: ReactNode }) => children,
  useAuth0: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

const useMembersMock = jest.spyOn(useMembersHook, 'useMembers') as jest.Mock
const useInviteMembersMock = jest.spyOn(useInviteMembersHook, 'useInviteMembers') as jest.Mock
const useAvailableRolesMock = jest.spyOn(useAvailableRolesHook, 'useAvailableRoles') as jest.Mock
const useEditMemberRoleMock = jest.spyOn(useEditMemberRoleHook, 'useEditMemberRole') as jest.Mock
const useDeleteMemberMock = jest.spyOn(useDeleteMemberHook, 'useDeleteMember') as jest.Mock
const useDeleteInviteMemberMock = jest.spyOn(useDeleteInviteMemberHook, 'useDeleteInviteMember') as jest.Mock
const useTransferOwnershipMemberRoleMock = jest.spyOn(
  useTransferOwnershipMemberRoleHook,
  'useTransferOwnershipMemberRole'
) as jest.Mock
const useCreateInviteMemberMock = jest.spyOn(useCreateInviteMemberHook, 'useCreateInviteMember') as jest.Mock

const availableRoles = [
  { id: 'role-owner', name: 'Owner' },
  { id: 'role-admin', name: 'Admin' },
]

const ownerMember = {
  ...membersMock(1, 'Owner', 'owner-id')[0],
  role_id: 'role-owner',
  role_name: 'Owner',
}

const adminMember = {
  ...membersMock(1, 'Admin', 'admin-id')[0],
  role_id: 'role-admin',
  role_name: 'Admin',
}

const inviteMember = {
  ...inviteMembersMock(1)[0],
  id: 'invite-1',
  email: 'invite@qovery.com',
  role_id: 'role-admin',
  role_name: 'Admin',
}

describe('SettingsMembers', () => {
  const editMemberRoleMock = jest.fn()
  const deleteMemberMock = jest.fn()
  const deleteInviteMemberMock = jest.fn()
  const transferOwnershipMemberRoleMock = jest.fn()
  const createInviteMemberMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    const useAuth0Mock = useAuth0 as jest.MockedFunction<typeof useAuth0>
    useAuth0Mock.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth0>)

    useMembersMock.mockReturnValue({
      data: [ownerMember, adminMember],
      isSuccess: true,
      error: undefined,
    })
    useInviteMembersMock.mockReturnValue({ data: [inviteMember] })
    useAvailableRolesMock.mockReturnValue({ data: availableRoles })
    useEditMemberRoleMock.mockReturnValue({ mutateAsync: editMemberRoleMock })
    useDeleteMemberMock.mockReturnValue({ mutateAsync: deleteMemberMock })
    useDeleteInviteMemberMock.mockReturnValue({ mutateAsync: deleteInviteMemberMock })
    useTransferOwnershipMemberRoleMock.mockReturnValue({ mutateAsync: transferOwnershipMemberRoleMock })
    useCreateInviteMemberMock.mockReturnValue({ mutateAsync: createInviteMemberMock })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsMembers />)
    expect(baseElement).toBeTruthy()
  })

  it('should open create modal when clicking add member', async () => {
    const { userEvent } = renderWithProviders(<SettingsMembers />)

    await userEvent.click(screen.getByRole('button', { name: /add member/i }))

    expect(mockOpenModal).toHaveBeenCalled()

    const [{ content, options }] = mockOpenModal.mock.calls[0]
    expect(options).toEqual(expect.objectContaining({ fakeModal: true }))
    expect(content.type).toBe(CreateModal)
  })

  it('should update member role when selecting a new role', async () => {
    const { userEvent } = renderWithProviders(<SettingsMembers />)

    const roleSelects = screen.getAllByTestId('input')
    const editableSelect = roleSelects.find((select) => !(select as HTMLSelectElement).disabled)

    if (!editableSelect) {
      throw new Error('No editable role select found')
    }

    await userEvent.selectOptions(editableSelect, 'role-owner')

    await waitFor(() => {
      expect(editMemberRoleMock).toHaveBeenCalledWith({
        organizationId: 'org-1',
        memberRoleUpdateRequest: {
          user_id: adminMember.id,
          role_id: 'role-owner',
        },
      })
    })
  })

  it('should open confirmation and transfer ownership', async () => {
    const { userEvent } = renderWithProviders(<SettingsMembers />)

    await userEvent.click(screen.getByRole('button', { name: /member actions/i }))
    await userEvent.click(screen.getByText('Transfer ownership'))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm ownership transfer',
        name: adminMember.name,
      })
    )

    const [{ action }] = mockOpenModalConfirmation.mock.calls[0]
    await action()

    expect(transferOwnershipMemberRoleMock).toHaveBeenCalledWith({
      organizationId: 'org-1',
      userId: adminMember.id,
    })
  })

  it('should resend invite for pending members', async () => {
    const { userEvent } = renderWithProviders(<SettingsMembers />)

    await userEvent.click(screen.getByRole('button', { name: /invite actions/i }))
    await userEvent.click(screen.getByText('Resend invite'))

    await waitFor(() => {
      expect(deleteInviteMemberMock).toHaveBeenCalledWith({
        organizationId: 'org-1',
        inviteId: inviteMember.id,
      })
      expect(createInviteMemberMock).toHaveBeenCalledWith({
        organizationId: 'org-1',
        inviteMemberRequest: {
          email: inviteMember.email,
          role_id: inviteMember.role_id,
        },
      })
    })
  })

  it('should display permission error callout when access is forbidden', () => {
    useMembersMock.mockReturnValue({
      data: [],
      isSuccess: false,
      error: { response: { status: 403 } },
    })

    renderWithProviders(<SettingsMembers />)

    expect(screen.getByText('Permission denied')).toBeInTheDocument()
  })
})

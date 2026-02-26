import { inviteMembersMock, membersMock } from '@qovery/shared/factories'
import { TablePrimitives } from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import RowMember, { type RowMemberProps } from './row-member'

const mockOpenModalConfirmation = jest.fn()

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    useModalConfirmation: () => ({
      openModalConfirmation: mockOpenModalConfirmation,
    }),
  }
})

const { Table } = TablePrimitives

const availableRoles = [
  { id: 'role-owner', name: 'Owner' },
  { id: 'role-admin', name: 'Admin' },
]

const columnSizes = [35, 22, 21, 21]

const baseMember = {
  ...membersMock(1, 'Admin', 'member-1')[0],
  role_id: 'role-admin',
  role_name: 'Admin',
}

const baseInviteMember = {
  ...inviteMembersMock(1)[0],
  id: 'invite-1',
  email: 'invite@qovery.com',
  role_id: 'role-admin',
  role_name: 'Admin',
}

const renderRowMember = (overrideProps?: Partial<RowMemberProps>) => {
  const props: RowMemberProps = {
    member: baseMember,
    editMemberRole: jest.fn(),
    deleteMember: jest.fn(),
    transferOwnership: jest.fn(),
    columnSizes,
    availableRoles,
    ...overrideProps,
  }

  return {
    props,
    ...renderWithProviders(
      <Table.Root>
        <Table.Body>
          <RowMember {...props} />
        </Table.Body>
      </Table.Root>
    ),
  }
}

describe('RowMember', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderRowMember()
    expect(baseElement).toBeTruthy()
  })

  it('should have disabled input for owner', () => {
    const ownerMember = {
      ...membersMock(1, 'Owner', 'member-owner')[0],
      role_id: 'role-owner',
      role_name: 'Owner',
    }

    renderRowMember({ member: ownerMember })

    expect(screen.getByTestId('input')).toBeDisabled()
  })

  it('should have disabled input while loading', () => {
    renderRowMember({ loadingUpdateRole: true })

    expect(screen.getByTestId('input')).toBeDisabled()
  })

  it('should show last activity and created date', () => {
    renderRowMember()

    const dateLastActivity = screen.getByTestId('last-activity')
    const dateCreatedAt = screen.getByTestId('created-at')

    expect(dateLastActivity).toHaveTextContent(/ago/i)
    expect(dateCreatedAt).toHaveTextContent(dateMediumLocalFormat(baseMember.created_at))
  })

  it('should call editMemberRole when selecting a new role', async () => {
    const { props, userEvent } = renderRowMember()

    await userEvent.click(screen.getByRole('button', { name: /member role/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Owner' }))

    expect(props.editMemberRole).toHaveBeenCalledWith(baseMember.id, 'role-owner')
  })

  it('should call transferOwnership when user is owner', async () => {
    const member = { ...baseMember }
    const transferOwnership = jest.fn()

    const { userEvent } = renderRowMember({ member, transferOwnership, userIsOwner: true })

    await userEvent.click(screen.getByRole('button', { name: /member actions/i }))
    await userEvent.click(screen.getByText('Transfer ownership'))

    expect(transferOwnership).toHaveBeenCalledWith(member)
  })

  it('should call resendInvite for pending members', async () => {
    const resendInvite = jest.fn()

    const { userEvent } = renderRowMember({
      member: baseInviteMember,
      resendInvite,
    })

    await userEvent.click(screen.getByRole('button', { name: /invite actions/i }))
    await userEvent.click(screen.getByText('Resend invite'))

    expect(resendInvite).toHaveBeenCalledWith(baseInviteMember.id, {
      email: baseInviteMember.email,
      role_id: baseInviteMember.role_id,
    })
  })
})

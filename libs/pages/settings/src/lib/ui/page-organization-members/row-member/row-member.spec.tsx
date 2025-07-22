import { inviteMembersMock, membersMock } from '@qovery/shared/factories'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import RowMember, { type RowMemberProps } from './row-member'

describe('RowMember', () => {
  const props: RowMemberProps = {
    member: membersMock(1)[0],
    editMemberRole: jest.fn(),
    deleteMember: jest.fn(),
    transferOwnership: jest.fn(),
    loading: false,
    columnsWidth: '',
    filter: [],
    availableRoles: [
      {
        id: '1',
        name: 'Owner',
      },
      {
        id: '2',
        name: 'Admin',
      },
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<RowMember {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have disabled input', () => {
    const memberOwner = membersMock(1)[0]
    memberOwner.role_name = 'Owner'

    props.member = memberOwner

    renderWithProviders(<RowMember {...props} />)

    const input = screen.getByTestId('input')

    expect(input).toHaveClass('bg-neutral-100 border-neutral-250 text-neutral-350')
  })

  it('should have loading input', () => {
    props.loadingUpdateRole = true

    renderWithProviders(<RowMember {...props} />)

    screen.getByTestId('spinner')
  })

  it('should have last activity and created date', () => {
    renderWithProviders(<RowMember {...props} />)

    const dateLastActivity = screen.getByTestId('last-activity')
    const dateCreatedAt = screen.getByTestId('created-at')

    expect(dateLastActivity).toHaveTextContent(/[0|1] second[s]* ago/)
    expect(dateCreatedAt).toHaveTextContent(dateMediumLocalFormat(props.member.created_at))
  })

  it('should have menu with edit member role action', async () => {
    const spy = jest.fn()
    props.editMemberRole = spy
    props.member = membersMock(1)[0]

    const { userEvent } = renderWithProviders(<RowMember {...props} />)
    await userEvent.click(screen.getByTestId('input'))

    const items = screen.getAllByTestId('menuItem')

    await userEvent.click(items[0])

    expect(spy).toHaveBeenCalled()
  })

  it('should have menu with transfer member role action', async () => {
    const spy = jest.fn()
    props.transferOwnership = spy
    props.userIsOwner = true
    props.member = membersMock(1)[0]

    const { userEvent } = renderWithProviders(<RowMember {...props} />)
    await userEvent.click(screen.getByTestId('element'))

    const items = screen.getAllByTestId('menuItem')

    await userEvent.click(items[0])

    expect(spy).toHaveBeenCalled()
  })

  it('should have menu with resend invite action', async () => {
    const spy = jest.fn()
    props.resendInvite = spy
    props.member = inviteMembersMock(1)[0]

    const { userEvent } = renderWithProviders(<RowMember {...props} />)
    await userEvent.click(screen.getByTestId('element'))

    const items = screen.getAllByTestId('menuItem')

    await userEvent.click(items[0])

    expect(spy).toHaveBeenCalled()
  })

  it('should have menu with enable member action for admin users', async () => {
    const spy = jest.fn()
    props.enableMember = spy
    props.userIsAdmin = true
    props.member = membersMock(1)[0]

    const { userEvent } = renderWithProviders(<RowMember {...props} />)
    await userEvent.click(screen.getByTestId('element'))

    const items = screen.getAllByTestId('menuItem')
    const enableMemberItem = items.find((item) => item.textContent?.includes('Enable member'))

    expect(enableMemberItem).toBeTruthy()
    if (enableMemberItem) {
      await userEvent.click(enableMemberItem)
    }
    expect(spy).toHaveBeenCalledWith(props.member.email)
  })

  it('should not show enable member action for non-admin users', () => {
    props.userIsAdmin = false
    props.member = membersMock(1)[0]

    renderWithProviders(<RowMember {...props} />)

    const enableMemberItem = screen.queryByText('Enable member')
    expect(enableMemberItem).not.toBeInTheDocument()
  })
})

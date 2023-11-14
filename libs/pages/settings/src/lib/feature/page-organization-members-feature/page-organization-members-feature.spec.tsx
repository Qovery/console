import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { membersMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationMembersFeature from './page-organization-members-feature'

import SpyInstance = jest.SpyInstance

const useEditMemberRoleSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useEditMemberRole')
const useMembersSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useMembers')
const useTransferOwnershipMemberRoleSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useTransferOwnershipMemberRole')
const useDeleteInviteMemberSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useDeleteInviteMember')
const useCreateInviteMemberSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useCreateInviteMember')

const useAvailableRolesMockSpy = jest.spyOn(organizationsDomain, 'useAvailableRoles') as jest.Mock
const mockMembers = [...membersMock(1, 'Owner', '0'), ...membersMock(1, 'Admin', '1')]

jest.mock('@qovery/domains/users/data-access', () => {
  return {
    ...jest.requireActual('@qovery/domains/users/data-access'),
    selectUser: () => ({
      sub: '0',
    }),
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0' }),
}))

describe('PageOrganizationMembersFeature', () => {
  beforeEach(() => {
    useAvailableRolesMockSpy.mockReturnValue({
      data: [
        {
          id: '0',
          name: 'my-role',
        },
      ],
    })
    useEditMemberRoleSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useTransferOwnershipMemberRoleSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useDeleteInviteMemberSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useCreateInviteMemberSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useMembersSpy.mockReturnValue({
      data: mockMembers,
    })
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationMembersFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have dispatch to edit member role', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)

    const items = screen.getAllByTestId('menuItem')

    // 5 is menu for row members
    await userEvent.click(items[5])

    expect(useEditMemberRoleSpy).toBeCalled()
  })

  it('should have dispatch to transfer ownership', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)

    const items = screen.getAllByTestId('menuItem')

    // 3 is menu for row members
    await userEvent.click(items[3])

    expect(useTransferOwnershipMemberRoleSpy).toBeCalled()
    expect(useMembersSpy).toBeCalled()
  })

  it('should have dispatch resend invite', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)

    const items = screen.getAllByTestId('menuItem')

    // 8 is menu for resend invite
    await userEvent.click(items[8])

    expect(useDeleteInviteMemberSpy).toBeCalled()
    expect(useCreateInviteMemberSpy).toBeCalled()
  })
})

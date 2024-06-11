import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { membersMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationMembersFeature from './page-organization-members-feature'

import SpyInstance = jest.SpyInstance

const useEditMemberRoleSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useEditMemberRole')
const useMembersSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useMembers')
const useInviteMembersSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useInviteMembers')
const useTransferOwnershipMemberRoleSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useTransferOwnershipMemberRole')
const useDeleteInviteMemberSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useDeleteInviteMember')
const useCreateInviteMemberSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useCreateInviteMember')

const useAvailableRolesMockSpy = jest.spyOn(organizationsDomain, 'useAvailableRoles') as jest.Mock
// XXX: Prevent infinite loading
// https://github.com/Qovery/console/blob/b2a922b8bf94b31e9f9e49449ff124785667b875/libs/pages/settings/src/lib/ui/page-organization-members/page-organization-members.tsx#L144
const mockMembers = [...membersMock(1, 'Owner', '10'), ...membersMock(1, 'Admin', '11')]

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
      isFetched: true,
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
      isFetched: true,
    })
    useInviteMembersSpy.mockReturnValue({
      data: [],
      isFetched: true,
    })
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationMembersFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have dispatch to edit member role', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)
    await userEvent.click(screen.getByTestId('element'))

    const items = screen.getAllByTestId('menuItem')

    // menu for row members
    await userEvent.click(items[5])

    expect(useEditMemberRoleSpy).toHaveBeenCalled()
  })

  it('should have dispatch to transfer ownership', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)
    await userEvent.click(screen.getByTestId('element'))
    const items = screen.getAllByTestId('menuItem')

    // menu for row members
    await userEvent.click(items[3])

    expect(useTransferOwnershipMemberRoleSpy).toHaveBeenCalled()
    expect(useMembersSpy).toHaveBeenCalled()
  })

  it('should have dispatch resend invite', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)
    await userEvent.click(screen.getByTestId('element'))
    const items = screen.getAllByTestId('menuItem')

    // menu for resend invite
    await userEvent.click(items[8])

    expect(useDeleteInviteMemberSpy).toHaveBeenCalled()
    expect(useCreateInviteMemberSpy).toHaveBeenCalled()
  })
})

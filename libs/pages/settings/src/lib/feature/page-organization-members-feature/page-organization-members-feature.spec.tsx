import * as storeOrganization from '@qovery/domains/organization'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationMembersFeature from './page-organization-members-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization = organizationFactoryMock(1)[0]
const useAvailableRolesMockSpy = jest.spyOn(organizationsDomain, 'useAvailableRoles') as jest.Mock

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editMemberRole: jest.fn(),
    selectOrganizationById: () => mockOrganization,
  }
})

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
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationMembersFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have dispatch to edit member role', async () => {
    const editMemberRoleSpy: SpyInstance = jest.spyOn(storeOrganization, 'editMemberRole')

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)

    const items = screen.getAllByTestId('menuItem')

    // 5 is menu for row members
    await userEvent.click(items[5])

    expect(editMemberRoleSpy).toBeCalled()
  })

  it('should have dispatch to transfer ownership', async () => {
    const transferOwnershipSpy: SpyInstance = jest.spyOn(storeOrganization, 'transferOwnershipMemberRole')
    const fetchMembersSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchMembers')

    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve(mockOrganization.members?.items),
    }))

    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)

    const items = screen.getAllByTestId('menuItem')

    // 3 is menu for row members
    await userEvent.click(items[3])

    expect(transferOwnershipSpy).toBeCalled()
    expect(fetchMembersSpy).toBeCalled()
  })

  it('should have dispatch resend invite', async () => {
    const resendInviteSpy: SpyInstance = jest.spyOn(storeOrganization, 'deleteInviteMember')
    const postInviteMemberSpy: SpyInstance = jest.spyOn(storeOrganization, 'postInviteMember')

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { userEvent } = renderWithProviders(<PageOrganizationMembersFeature />)

    const items = screen.getAllByTestId('menuItem')

    // 7 is menu for resend invite
    await userEvent.click(items[7])

    expect(resendInviteSpy).toBeCalled()
    expect(postInviteMemberSpy).toBeCalled()
  })
})

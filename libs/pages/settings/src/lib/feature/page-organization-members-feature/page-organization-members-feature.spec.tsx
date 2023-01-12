import { act, render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
import { organizationFactoryMock } from '@qovery/shared/factories'
import PageOrganizationMembersFeature from './page-organization-members-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization = organizationFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editMemberRole: jest.fn(),
    selectOrganizationById: () => mockOrganization,
  }
})

jest.mock('@qovery/domains/user', () => {
  return {
    ...jest.requireActual('@qovery/domains/user'),
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
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '0' }),
}))

describe('PageOrganizationMembersFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationMembersFeature />)
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

    const { getAllByTestId } = render(<PageOrganizationMembersFeature />)

    const items = getAllByTestId('menuItem')

    await act(() => {
      // 5 is menu for row members
      items[5].click()
    })

    expect(editMemberRoleSpy).toBeCalled()
  })

  it('should have dispatch to transfer ownership', async () => {
    const transferOwnershipSpy: SpyInstance = jest.spyOn(storeOrganization, 'transferOwnershipMemberRole')
    const fetchMembersSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchMembers')

    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve(mockOrganization.members?.items),
    }))

    const { getAllByTestId } = render(<PageOrganizationMembersFeature />)

    const items = getAllByTestId('menuItem')

    await act(() => {
      // 3 is menu for row members
      items[3].click()
    })

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

    const { getAllByTestId } = render(<PageOrganizationMembersFeature />)

    const items = getAllByTestId('menuItem')

    await act(() => {
      // 8 is menu for resend invite
      items[8].click()
    })

    expect(resendInviteSpy).toBeCalled()
    expect(postInviteMemberSpy).toBeCalled()
  })
})

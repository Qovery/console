import { membersMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationMembers, { type PageOrganizationMembersProps } from './page-organization-members'

describe('PageOrganizationMembers', () => {
  const props: PageOrganizationMembersProps = {
    editMemberRole: jest.fn(),
    deleteMember: jest.fn(),
    deleteInviteMember: jest.fn(),
    transferOwnership: jest.fn(),
    resendInvite: jest.fn(),
    members: membersMock(4),
    loadingUpdateRole: { userId: '0', loading: false },
    isFetchedMembers: true,
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<PageOrganizationMembers {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

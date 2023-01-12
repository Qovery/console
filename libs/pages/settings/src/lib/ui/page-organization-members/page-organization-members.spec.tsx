import { render } from '__tests__/utils/setup-jest'
import { membersMock } from '@qovery/shared/factories'
import PageOrganizationMembers, { PageOrganizationMembersProps } from './page-organization-members'

describe('PageOrganizationMembers', () => {
  const props: PageOrganizationMembersProps = {
    editMemberRole: jest.fn(),
    deleteMember: jest.fn(),
    deleteInviteMember: jest.fn(),
    transferOwnership: jest.fn(),
    resendInvite: jest.fn(),
    members: membersMock(4),
    setDataMembers: jest.fn(),
    setDataInviteMembers: jest.fn(),
    loadingUpdateRole: { userId: '0', loading: false },
    loadingMembers: false,
    loadingInviteMembers: false,
  }

  it('should render successfully', async () => {
    const { baseElement } = render(<PageOrganizationMembers {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have help section', () => {
    const { getByTestId } = render(<PageOrganizationMembers {...props} />)
    getByTestId('help-section')
  })
})

import { render } from '__tests__/utils/setup-jest'
import { membersMock } from '@qovery/domains/organization'
import PageOrganizationMembers, { PageOrganizationMembersProps } from './page-organization-members'

describe('PageOrganizationMembers', () => {
  const props: PageOrganizationMembersProps = {
    editMemberRole: jest.fn(),
    deleteMember: jest.fn(),
    transferOwnership: jest.fn(),
    members: membersMock(4),
    setFilterMembers: jest.fn(),
    loadingUpdateRole: { userId: '0', loading: false },
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

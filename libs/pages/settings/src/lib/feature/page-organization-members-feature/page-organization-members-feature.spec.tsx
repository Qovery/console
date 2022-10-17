import { act, render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
import PageOrganizationMembersFeature from './page-organization-members-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization = storeOrganization.organizationFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editMemberRole: jest.fn(),
    selectOrganizationById: () => mockOrganization,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
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
})

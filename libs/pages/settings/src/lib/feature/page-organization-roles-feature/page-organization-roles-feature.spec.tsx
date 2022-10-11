import { act, render } from '__tests__/utils/setup-jest'
import {
  EnvironmentModeEnum,
  OrganizationCustomRole,
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleProjectPermission,
} from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import PageOrganizationRolesFeature, { getValue, handleSubmit, resetForm } from './page-organization-roles-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization = storeOrganization.organizationFactoryMock(1)[0]
const mockCustomRole: OrganizationCustomRole = storeOrganization.customRolesMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editCustomRole: jest.fn(),
    selectOrganizationById: () => {
      const currentMockOrganization = mockOrganization
      return currentMockOrganization
    },
    fetchCustomRoles: () => {
      return [mockCustomRole]
    },
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

describe('PageOrganizationRoles', () => {
  const dataSubmit = {
    id: mockCustomRole.id,
    name: mockCustomRole.name,
    description: mockCustomRole.description,
    cluster_permissions: [
      {
        cluster_id: '1',
        permission: OrganizationCustomRoleClusterPermission.ENV_CREATOR,
      },
    ],
    project_permissions: [
      {
        project_id: '1',
        project_name: mockCustomRole.project_permissions ? mockCustomRole.project_permissions[0].project_name : [],
        is_admin: false,
        permissions: [
          {
            environment_type: EnvironmentModeEnum.DEVELOPMENT,
            permission: OrganizationCustomRoleProjectPermission.MANAGER,
          },
        ],
      },
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationRolesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have resetForm function', () => {
    const result = resetForm(mockCustomRole)
    expect(result).toStrictEqual({
      cluster_permissions: { '1': OrganizationCustomRoleClusterPermission.ADMIN },
      project_permissions: {
        '1': {
          ADMIN: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          DEVELOPMENT: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
      },
      name: mockCustomRole.name,
      description: mockCustomRole.description,
    })
  })

  it('should have handleSubmit function', () => {
    const formData = {
      cluster_permissions: { '1': OrganizationCustomRoleClusterPermission.ENV_CREATOR },
      project_permissions: {
        '1': {
          [EnvironmentModeEnum.DEVELOPMENT]: OrganizationCustomRoleProjectPermission.MANAGER,
        },
      },
      name: mockCustomRole.name,
      description: mockCustomRole.description,
    }

    const cloneCustomRole = handleSubmit(formData, mockCustomRole)

    if (mockCustomRole.cluster_permissions && mockCustomRole.project_permissions) {
      expect(cloneCustomRole).toStrictEqual(dataSubmit)
    }
  })

  it('should have getValue helper', () => {
    expect(getValue(OrganizationCustomRoleProjectPermission.VIEWER, false)).toBe(
      OrganizationCustomRoleProjectPermission.VIEWER
    )
    expect(getValue(OrganizationCustomRoleProjectPermission.NO_ACCESS, true)).toBe(
      OrganizationCustomRoleProjectPermission.MANAGER
    )
  })

  it('should dispatch editCustomRole if form is submitted', async () => {
    const editCustomRoleSpy: SpyInstance = jest.spyOn(storeOrganization, 'editCustomRole')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { debug, getByTestId } = render(<PageOrganizationRolesFeature />)

    debug()

    expect(getByTestId('submit-save-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-save-button').click()
    })

    // const newOrganization = {
    //   name: 'hello-world',
    //   website_url: 'https://qovery.com',
    //   logo_url: 'my-logo',
    //   description: 'description',
    //   admin_emails: ['test@test.com'],
    // }

    const cloneOrganization = handleSubmit(dataSubmit, mockCustomRole)

    expect(editCustomRoleSpy.mock.calls[0][0].organizationId).toBe('0')
    // expect(cloneOrganization.name).toBe('hello-world')
    // expect(cloneOrganization.description).toBe('description')
    // expect(cloneOrganization.website_url).toBe('https://qovery.com')
    // expect(cloneOrganization.logo_url).toBe('my-logo')
  })
})

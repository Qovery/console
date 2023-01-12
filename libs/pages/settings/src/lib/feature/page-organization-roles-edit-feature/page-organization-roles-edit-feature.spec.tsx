import { render, waitFor } from '__tests__/utils/setup-jest'
import {
  EnvironmentModeEnum,
  OrganizationCustomRole,
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleProjectPermission,
} from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import { organizationFactoryMock } from '@qovery/shared/factories'
import PageOrganizationRolesEditFeature, {
  getValue,
  handleSubmit,
  resetForm,
} from './page-organization-roles-edit-feature'

import SpyInstance = jest.SpyInstance

const mockOrganization = organizationFactoryMock(1)[0]
const mockCustomRole: OrganizationCustomRole[] = mockOrganization.customRoles?.items || []

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editCustomRole: jest.fn(),
    selectOrganizationById: () => {
      const currentMockOrganization = mockOrganization
      if (currentMockOrganization.customRoles) currentMockOrganization.customRoles.loadingStatus = 'loaded'
      return currentMockOrganization
    },
    fetchCustomRoles: () => {
      return mockCustomRole
    },
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

describe('PageOrganizationRolesEdit', () => {
  const dataSubmit = {
    id: mockCustomRole[0].id,
    name: mockCustomRole[0].name,
    description: mockCustomRole[0].description,
    cluster_permissions: [
      {
        cluster_id: '1',
        cluster_name: 'aws',
        permission: OrganizationCustomRoleClusterPermission.ENV_CREATOR,
      },
    ],
    project_permissions: [
      {
        project_id: '1',
        project_name: mockCustomRole[0].project_permissions
          ? mockCustomRole[0].project_permissions[0].project_name
          : '',
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

  const formData = {
    cluster_permissions: { '1': OrganizationCustomRoleClusterPermission.ENV_CREATOR },
    project_permissions: {
      '1': {
        [EnvironmentModeEnum.DEVELOPMENT]: OrganizationCustomRoleProjectPermission.MANAGER,
      },
    },
    name: mockCustomRole[0].name,
    description: mockCustomRole[0].description,
  }

  it('should render successfully', () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve(mockCustomRole),
    }))
    const { baseElement } = render(<PageOrganizationRolesEditFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have resetForm function', () => {
    const result = resetForm(mockCustomRole[0])
    expect(result).toStrictEqual({
      cluster_permissions: { '1': OrganizationCustomRoleClusterPermission.ADMIN },
      project_permissions: {
        '1': {
          ADMIN: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          DEVELOPMENT: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          PREVIEW: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          PRODUCTION: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          STAGING: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
      },
      name: mockCustomRole[0].name,
      description: mockCustomRole[0].description,
    })
  })

  it('should have handleSubmit function', () => {
    const cloneCustomRole = handleSubmit(formData, mockCustomRole[0])

    if (mockCustomRole[0].cluster_permissions && mockCustomRole[0].project_permissions) {
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
      unwrap: () => Promise.resolve(mockCustomRole[0]),
      then: () => Promise.resolve(mockCustomRole[0]),
    }))

    const { getByTestId } = render(<PageOrganizationRolesEditFeature />)

    await waitFor(() => {
      const button = getByTestId('submit-save-button')
      expect(button).not.toBeDisabled()
      button.click()
    })

    await waitFor(() => {
      expect(editCustomRoleSpy).toHaveBeenCalledWith({
        data: mockCustomRole[0],
        organizationId: '0',
        customRoleId: mockCustomRole[0].id,
      })
    })
  })
})

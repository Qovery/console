import {
  EnvironmentModeEnum,
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleProjectPermission,
} from 'qovery-typescript-axios'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import PageOrganizationRolesEditFeature, {
  getValue,
  handleSubmit,
  resetForm,
} from './page-organization-roles-edit-feature'

import SpyInstance = jest.SpyInstance

const useEditCustomRoleSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useEditCustomRole')
const useCustomRoleSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useCustomRole')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0' }),
}))

const customRoleMock = {
  id: '1',
  name: 'my-custom-role',
  description: 'my description',
  cluster_permissions: [
    {
      cluster_id: '1',
      cluster_name: 'aws',
      permission: OrganizationCustomRoleClusterPermission.ADMIN,
    },
  ],
  project_permissions: [
    {
      project_id: '1',
      project_name: 'my-project-name',
      is_admin: false,
      permissions: [
        {
          environment_type: EnvironmentModeEnum.DEVELOPMENT,
          permission: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
        {
          environment_type: EnvironmentModeEnum.PREVIEW,
          permission: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
        {
          environment_type: EnvironmentModeEnum.STAGING,
          permission: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
        {
          environment_type: EnvironmentModeEnum.PRODUCTION,
          permission: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
      ],
    },
  ],
}

const dataSubmit = {
  id: '1',
  name: 'my-custom-role',
  description: 'my description',
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
      project_name: 'my-project-name',
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
  name: 'my-custom-role',
  description: 'my description',
}

describe('PageOrganizationRolesEdit', () => {
  beforeEach(() => {
    useEditCustomRoleSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useCustomRoleSpy.mockReturnValue({
      data: customRoleMock,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationRolesEditFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have resetForm function', () => {
    const result = resetForm(customRoleMock)
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
      name: 'my-custom-role',
      description: 'my description',
    })
  })

  it('should have handleSubmit function', () => {
    const cloneCustomRole = handleSubmit(formData, customRoleMock)
    expect(cloneCustomRole).toStrictEqual(dataSubmit)
  })

  it('should have getValue helper', () => {
    expect(getValue(OrganizationCustomRoleProjectPermission.VIEWER, false)).toBe(
      OrganizationCustomRoleProjectPermission.VIEWER
    )
    expect(getValue(OrganizationCustomRoleProjectPermission.NO_ACCESS, true)).toBe(
      OrganizationCustomRoleProjectPermission.MANAGER
    )
  })

  it('should edit custom role if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationRolesEditFeature />)

    const button = screen.getByTestId('submit-save-button')
    waitFor(() => {
      expect(button).toBeEnabled()
    })

    await userEvent.click(button)

    expect(useEditCustomRoleSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      customRoleId: '1',
      customRoleUpdateRequest: customRoleMock,
    })
  })
})

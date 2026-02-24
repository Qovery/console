import { useNavigate, useParams } from '@tanstack/react-router'
import {
  EnvironmentModeEnum,
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleProjectPermission,
} from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { customRolesMock } from '@qovery/shared/factories'
import { useModalConfirmation } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useCustomRole } from '../hooks/use-custom-role/use-custom-role'
import { useDeleteCustomRole } from '../hooks/use-delete-custom-role/use-delete-custom-role'
import { useEditCustomRole } from '../hooks/use-edit-custom-role/use-edit-custom-role'
import { SettingsRolesEdit, getValue, handleSubmit, resetForm } from './settings-roles-edit'

jest.mock('../hooks/use-custom-role/use-custom-role')
jest.mock('../hooks/use-delete-custom-role/use-delete-custom-role')
jest.mock('../hooks/use-edit-custom-role/use-edit-custom-role')

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModalConfirmation: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}))

describe('SettingsRolesEdit', () => {
  const useCustomRoleMock = useCustomRole as jest.MockedFunction<typeof useCustomRole>
  const useDeleteCustomRoleMock = useDeleteCustomRole as jest.MockedFunction<typeof useDeleteCustomRole>
  const useEditCustomRoleMock = useEditCustomRole as jest.MockedFunction<typeof useEditCustomRole>
  const useModalConfirmationMock = useModalConfirmation as jest.MockedFunction<typeof useModalConfirmation>
  const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
  const useNavigateMock = useNavigate as jest.MockedFunction<typeof useNavigate>

  const customRole = customRolesMock(1)[0]

  beforeEach(() => {
    jest.clearAllMocks()

    useCustomRoleMock.mockReturnValue({
      data: customRole,
    } as unknown as ReturnType<typeof useCustomRole>)
    useEditCustomRoleMock.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useEditCustomRole>)
    useDeleteCustomRoleMock.mockReturnValue({
      mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useDeleteCustomRole>)
    useModalConfirmationMock.mockReturnValue({
      openModalConfirmation: jest.fn(),
    })
    useParamsMock.mockReturnValue({
      organizationId: '0',
      roleId: customRole.id ?? '0',
    })
    useNavigateMock.mockReturnValue(jest.fn())
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<SettingsRolesEdit />)
    await screen.findByTestId('input-name')
    expect(baseElement).toBeTruthy()
  })

  it('should submit edited role data', async () => {
    const { userEvent } = renderWithProviders(<SettingsRolesEdit />)

    const nameInput = await screen.findByTestId('input-name')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'updated-role')

    const saveButton = screen.getByTestId('submit-save-button')
    expect(saveButton).toBeEnabled()

    await userEvent.click(saveButton)

    expect(useEditCustomRoleMock().mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: '0',
        customRoleId: customRole.id,
        customRoleUpdateRequest: expect.objectContaining({ name: 'updated-role' }),
      })
    )
  })

  it('should open confirmation modal when deleting a role', async () => {
    const openModalConfirmation = jest.fn()
    useModalConfirmationMock.mockReturnValue({
      openModalConfirmation,
    })

    renderWithProviders(<SettingsRolesEdit />)

    const deleteButton = await screen.findByTestId('delete-button')
    await deleteButton.click()

    expect(openModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: customRole.name,
      })
    )
  })
})

describe('SettingsRolesEdit helpers', () => {
  const customRole = customRolesMock(1)[0]

  it('should build default form values', () => {
    const result = resetForm(customRole)

    expect(result).toStrictEqual({
      cluster_permissions: {
        [customRole.cluster_permissions?.[0].cluster_id ?? '']: OrganizationCustomRoleClusterPermission.ADMIN,
      },
      project_permissions: {
        [customRole.project_permissions?.[0].project_id ?? '']: {
          ADMIN: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          [EnvironmentModeEnum.DEVELOPMENT]: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          [EnvironmentModeEnum.PREVIEW]: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          [EnvironmentModeEnum.STAGING]: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          [EnvironmentModeEnum.PRODUCTION]: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
      },
      name: customRole.name,
      description: customRole.description ?? ' ',
    })
  })

  it('should transform form data into a role update request', () => {
    const formData = resetForm(customRole)
    const projectId = customRole.project_permissions?.[0].project_id ?? ''
    const clusterId = customRole.cluster_permissions?.[0].cluster_id ?? ''

    formData.name = 'new-role'
    formData.description = 'new-description'
    formData.cluster_permissions[clusterId] = OrganizationCustomRoleClusterPermission.ENV_CREATOR
    formData.project_permissions[projectId][EnvironmentModeEnum.DEVELOPMENT] =
      OrganizationCustomRoleProjectPermission.MANAGER

    const result = handleSubmit(formData, customRole)

    expect(result.name).toBe('new-role')
    expect(result.description).toBe('new-description')
    expect(result.cluster_permissions?.[0].permission).toBe(OrganizationCustomRoleClusterPermission.ENV_CREATOR)
    expect(result.project_permissions?.[0].permissions).toEqual([
      {
        environment_type: EnvironmentModeEnum.DEVELOPMENT,
        permission: OrganizationCustomRoleProjectPermission.MANAGER,
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
    ])
  })

  it('should resolve project permission values', () => {
    expect(getValue(OrganizationCustomRoleProjectPermission.VIEWER, false)).toBe(
      OrganizationCustomRoleProjectPermission.VIEWER
    )
    expect(getValue(OrganizationCustomRoleProjectPermission.NO_ACCESS, true)).toBe(
      OrganizationCustomRoleProjectPermission.MANAGER
    )
  })
})

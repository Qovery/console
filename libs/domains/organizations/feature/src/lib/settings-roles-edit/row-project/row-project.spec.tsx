import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  OrganizationCustomRoleProjectPermission,
  type OrganizationCustomRoleProjectPermissionsInner,
} from 'qovery-typescript-axios'
import { customRolesMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import RowProject, { OrganizationCustomRoleProjectPermissionAdmin } from './row-project'

const customRole = customRolesMock(1)[0]
const project = (customRole.project_permissions &&
  customRole.project_permissions[0]) as OrganizationCustomRoleProjectPermissionsInner

describe('RowProject', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<RowProject project={project} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render header with global checkbox', async () => {
    const { userEvent, getByText, getByTestId } = renderWithProviders(
      wrapWithReactHookForm(<RowProject project={project} />)
    )

    getByText(project.project_name || '')
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`)
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.MANAGER}`)
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.DEPLOYER}`)
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.VIEWER}`)
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.NO_ACCESS}`)

    const input = getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`) as HTMLInputElement
    await userEvent.click(input)

    expect(input).toBeChecked()
  })

  it('should set permission to NO_ACCESS when clicking an already-selected permission (AC-1)', async () => {
    project.is_admin = false

    const defaultValues = {
      project_permissions: {
        '1': {
          ADMIN: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          DEVELOPMENT: OrganizationCustomRoleProjectPermission.MANAGER,
          PREVIEW: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          STAGING: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          PRODUCTION: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
      },
    }

    const { container, userEvent } = renderWithProviders(
      wrapWithReactHookForm(<RowProject project={project} />, { defaultValues })
    )

    const managerCheckbox = container.querySelector('button[value="MANAGER"]') as HTMLButtonElement
    expect(managerCheckbox).toBeChecked()

    await userEvent.click(managerCheckbox)

    expect(managerCheckbox).not.toBeChecked()
    const noAccessCheckbox = container.querySelector('button[value="NO_ACCESS"]') as HTMLButtonElement
    expect(noAccessCheckbox).toBeChecked()
  })

  it('should update global header to NO_ACCESS after all rows become NO_ACCESS (AC-2)', async () => {
    project.is_admin = false

    const defaultValues = {
      project_permissions: {
        '1': {
          ADMIN: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          DEVELOPMENT: OrganizationCustomRoleProjectPermission.MANAGER,
          PREVIEW: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          STAGING: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          PRODUCTION: OrganizationCustomRoleProjectPermission.NO_ACCESS,
        },
      },
    }

    const { container, getByTestId, userEvent } = renderWithProviders(
      wrapWithReactHookForm(<RowProject project={project} />, { defaultValues })
    )

    const headerNoAccess = getByTestId(`project.${OrganizationCustomRoleProjectPermission.NO_ACCESS}`)
    expect(headerNoAccess).not.toBeChecked()

    const managerCheckbox = container.querySelector('button[value="MANAGER"]') as HTMLButtonElement
    await userEvent.click(managerCheckbox)

    expect(headerNoAccess).toBeChecked()
  })

  it('should be admin by default and check global select', async () => {
    project.is_admin = true

    const { getByTestId, getAllByTestId, userEvent } = renderWithProviders(
      wrapWithReactHookForm(<RowProject project={project} />)
    )

    const input = getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`) as HTMLInputElement
    expect(input).toBeChecked()

    for (let i = 0; i < getAllByTestId('admin-checkbox').length; i++) {
      const permission = getAllByTestId('admin-checkbox')[i] as HTMLInputElement
      expect(permission).toBeDisabled()
    }

    await userEvent.click(input)

    expect(input).not.toBeChecked()

    for (let i = 0; i < getAllByTestId('admin-checkbox').length; i++) {
      const permission = getAllByTestId('admin-checkbox')[i] as HTMLInputElement
      expect(permission).toBeDisabled()
    }
  })
})

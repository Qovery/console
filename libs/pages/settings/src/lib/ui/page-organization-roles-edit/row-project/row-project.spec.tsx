import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  OrganizationCustomRoleProjectPermission,
  type OrganizationCustomRoleProjectPermissionsInner,
} from 'qovery-typescript-axios'
import { customRolesMock } from '@qovery/shared/factories'
import { resetForm } from '../../../feature/page-organization-roles-edit-feature/page-organization-roles-edit-feature'
import RowProject, { OrganizationCustomRoleProjectPermissionAdmin } from './row-project'

const customRole = customRolesMock(1)[0]
const project = (customRole.project_permissions &&
  customRole.project_permissions[0]) as OrganizationCustomRoleProjectPermissionsInner

describe('RowProject', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<RowProject project={project} />, {
        defaultValues: resetForm(customRole),
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render header with global checkbox', async () => {
    const { getByText, getByTestId } = render(wrapWithReactHookForm(<RowProject project={project} />))

    getByText(project.project_name || '')
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`)
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.MANAGER}`)
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.DEPLOYER}`)
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.VIEWER}`)
    getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.NO_ACCESS}`)

    const input = getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`) as HTMLInputElement

    await act(() => {
      fireEvent.click(input)
    })

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

    const { container } = render(wrapWithReactHookForm(<RowProject project={project} />, { defaultValues }))

    const managerInput = container.querySelector('input[value="MANAGER"]') as HTMLInputElement
    expect(managerInput).toBeChecked()

    await act(() => {
      fireEvent.click(managerInput)
    })

    expect(managerInput).not.toBeChecked()

    const noAccessInput = container.querySelector('input[value="NO_ACCESS"]:not([disabled])') as HTMLInputElement
    expect(noAccessInput).toBeChecked()
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

    const { container, getByTestId } = render(
      wrapWithReactHookForm(<RowProject project={project} />, { defaultValues })
    )

    const headerNoAccess = getByTestId(
      `project.${OrganizationCustomRoleProjectPermission.NO_ACCESS}`
    ) as HTMLInputElement
    expect(headerNoAccess).not.toBeChecked()

    const managerInput = container.querySelector('input[value="MANAGER"]') as HTMLInputElement
    await act(() => {
      fireEvent.click(managerInput)
    })

    expect(headerNoAccess).toBeChecked()
  })

  it('should be admin by default and check global select', async () => {
    project.is_admin = true

    const { getByTestId, getAllByTestId } = render(wrapWithReactHookForm(<RowProject project={project} />))

    const input = getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`) as HTMLInputElement
    expect(input).toBeChecked()

    for (let i = 0; i < getAllByTestId('admin-checkbox').length; i++) {
      const permission = getAllByTestId('admin-checkbox')[i] as HTMLInputElement
      expect(permission).toBeChecked()
    }

    await act(() => {
      fireEvent.click(input)
    })

    expect(input).not.toBeChecked()

    for (let i = 0; i < getAllByTestId('admin-checkbox').length; i++) {
      const permission = getAllByTestId('admin-checkbox')[i] as HTMLInputElement
      expect(permission).not.toBeChecked()
    }
  })
})

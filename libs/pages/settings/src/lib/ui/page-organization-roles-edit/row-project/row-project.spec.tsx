import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type OrganizationCustomRoleProjectPermissionsInner } from 'qovery-typescript-axios'
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

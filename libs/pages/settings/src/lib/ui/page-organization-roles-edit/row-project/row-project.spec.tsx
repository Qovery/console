import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { customRolesMock } from '@qovery/shared/factories'
import { resetForm } from '../../../feature/page-organization-roles-edit-feature/page-organization-roles-edit-feature'
import RowProject, { OrganizationCustomRoleProjectPermissionAdmin } from './row-project'

const customRole = customRolesMock(1)[0]
const project = customRole.project_permissions && customRole.project_permissions[0]

describe('RowProject', () => {
  it('should render successfully', () => {
    if (project) {
      const { baseElement } = render(
        wrapWithReactHookForm(<RowProject project={project} />, {
          defaultValues: resetForm(customRole),
        })
      )
      expect(baseElement).toBeTruthy()
    }
  })

  it('should render header with global checkbox', async () => {
    if (project) {
      const { getByText, getByTestId } = render(wrapWithReactHookForm(<RowProject project={project} />))

      expect(getByText(project.project_name || ''))
      expect(getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`))
      expect(getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.MANAGER}`))
      expect(getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.DEPLOYER}`))
      expect(getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.VIEWER}`))
      expect(getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.NO_ACCESS}`))

      const input = getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`) as HTMLInputElement

      await act(() => {
        fireEvent.click(input)
      })

      expect(input.checked).toBe(true)
    }
  })

  it('should be admin by default and check global select', async () => {
    if (project) {
      project.is_admin = true

      const { getByTestId, getAllByTestId } = render(wrapWithReactHookForm(<RowProject project={project} />))

      const input = getByTestId(`project.${OrganizationCustomRoleProjectPermissionAdmin.ADMIN}`) as HTMLInputElement
      expect(input.checked).toBe(true)

      if (project.permissions) {
        for (let i = 0; i < getAllByTestId('admin-checkbox').length; i++) {
          const permission = getAllByTestId('admin-checkbox')[i] as HTMLInputElement
          expect(permission.checked).toBe(true)
        }

        await act(() => {
          fireEvent.click(input)
        })

        expect(input.checked).toBe(false)

        for (let i = 0; i < getAllByTestId('admin-checkbox').length; i++) {
          const permission = getAllByTestId('admin-checkbox')[i] as HTMLInputElement
          expect(permission.checked).toBe(false)
        }
      }
    }
  })
})

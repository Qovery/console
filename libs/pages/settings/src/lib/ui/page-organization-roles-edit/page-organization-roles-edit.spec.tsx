import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  EnvironmentModeEnum,
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleProjectPermission,
} from 'qovery-typescript-axios'
import { customRolesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { resetForm } from '../../feature/page-organization-roles-edit-feature/page-organization-roles-edit-feature'
import PageOrganizationRolesEdit, { type PageOrganizationRolesEditProps } from './page-organization-roles-edit'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}))

const customRole = customRolesMock(1)[0]

const defaultValues = resetForm({
  id: customRole.id,
  name: customRole.name,
  description: customRole.description,
  cluster_permissions: [
    {
      cluster_id: '1',
      permission: OrganizationCustomRoleClusterPermission.ENV_CREATOR,
    },
  ],
  project_permissions: [
    {
      project_id: '1',
      project_name: customRole.project_permissions ? customRole.project_permissions[0].project_name : '',
      is_admin: false,
      permissions: [
        {
          environment_type: EnvironmentModeEnum.DEVELOPMENT,
          permission: OrganizationCustomRoleProjectPermission.MANAGER,
        },
      ],
    },
  ],
})

describe('PageOrganizationRolesEdit', () => {
  const props: PageOrganizationRolesEditProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    onDeleteRole: jest.fn(),
    loading: false,
    loadingForm: false,
  }
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationRolesEdit {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should have loading screen', () => {
    props.currentRole = undefined
    props.loading = true

    renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationRolesEdit {...props} />, {
        defaultValues: defaultValues,
      })
    )

    screen.getByTestId('custom-roles-loader')
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.currentRole = customRole
    props.onSubmit = spy
    props.loading = false

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationRolesEdit {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const button = await screen.findByTestId('submit-save-button')
    screen.getByTestId('delete-button')
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    await userEvent.click(button)

    expect(props.onSubmit).toHaveBeenCalled()
  })
})

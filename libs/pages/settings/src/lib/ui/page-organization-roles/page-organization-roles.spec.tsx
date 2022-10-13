import { act, render, waitFor } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  EnvironmentModeEnum,
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleProjectPermission,
} from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { customRolesMock } from '@qovery/domains/organization'
import { resetForm } from '../../feature/page-organization-roles-feature/page-organization-roles-feature'
import PageOrganizationRoles, { PageOrganizationRolesProps } from './page-organization-roles'

const customRoles = customRolesMock(3)
const customRole = customRoles[0]

const defaultValues = resetForm({
  id: customRoles[0].id,
  name: customRoles[0].name,
  description: customRoles[0].description,
  cluster_permissions: [
    {
      cluster_id: '1',
      permission: OrganizationCustomRoleClusterPermission.ENV_CREATOR,
    },
  ],
  project_permissions: [
    {
      project_id: '1',
      project_name: customRoles[0].project_permissions ? customRoles[0].project_permissions[0].project_name : '',
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

describe('PageOrganizationRoles', () => {
  const props: PageOrganizationRolesProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    onAddRole: jest.fn(),
    onDeleteRole: jest.fn(),
    setCurrentRole: jest.fn(),
    loading: 'loaded',
    loadingForm: false,
    customRoles: customRoles,
  }
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageOrganizationRoles {...props} />, {
        defaultValues: defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should have loading screen', () => {
    props.customRoles = []
    props.loading = 'not loaded'

    const { getByTestId } = render(
      wrapWithReactHookForm(<PageOrganizationRoles {...props} />, {
        defaultValues: defaultValues,
      })
    )

    expect(getByTestId('custom-roles-loader'))
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    props.currentRole = customRole

    const { getByTestId } = render(
      wrapWithReactHookForm(<PageOrganizationRoles {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const select = getByTestId('select-custom-roles')
    selectEvent.select(select, customRole.name || '')

    const button = getByTestId('submit-save-button')
    getByTestId('delete-button')

    await waitFor(() => {
      button.click()
      expect(props.onSubmit).toHaveBeenCalled()
    })
  })

  it('should submit the form', async () => {
    props.customRoles = []
    props.loading = 'loaded'

    const { getByTestId } = render(
      wrapWithReactHookForm(<PageOrganizationRoles {...props} />, {
        defaultValues: defaultValues,
      })
    )

    getByTestId('empty-state')
  })
})

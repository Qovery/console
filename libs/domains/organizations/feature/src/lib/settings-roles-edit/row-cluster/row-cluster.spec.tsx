import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  OrganizationCustomRoleClusterPermission,
  type OrganizationCustomRoleClusterPermissionsInner,
} from 'qovery-typescript-axios'
import { customRolesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import RowCluster from './row-cluster'

const cluster = customRolesMock(1)[0].cluster_permissions?.[0]

if (!cluster) {
  throw new Error('Expected cluster permissions to be defined for tests.')
}

describe('RowCluster', () => {
  it('should render cluster name and permissions', () => {
    renderWithProviders(wrapWithReactHookForm(<RowCluster cluster={cluster} />))

    expect(screen.getByText(cluster.cluster_name)).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
  })

  it('should set permission to VIEWER when clicking an already-selected cluster permission (AC-3)', async () => {
    const defaultValues = {
      cluster_permissions: {
        '1': OrganizationCustomRoleClusterPermission.ADMIN,
      },
    }

    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(<RowCluster cluster={cluster} />, { defaultValues })
    )

    const adminCheckbox = container.querySelector('button[value="ADMIN"]') as HTMLButtonElement
    expect(adminCheckbox).toBeChecked()

    await userEvent.click(adminCheckbox)

    expect(adminCheckbox).not.toBeChecked()
    const viewerCheckbox = container.querySelector('button[value="VIEWER"]') as HTMLButtonElement
    expect(viewerCheckbox).toBeChecked()
  })

  it('should notify global check when a permission is selected', async () => {
    const setGlobalCheck = jest.fn()

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<RowCluster cluster={cluster} setGlobalCheck={setGlobalCheck} />)
    )

    const [firstCheckbox] = screen.getAllByRole('checkbox')
    await userEvent.click(firstCheckbox)

    expect(setGlobalCheck).toHaveBeenCalled()
  })
})

import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
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

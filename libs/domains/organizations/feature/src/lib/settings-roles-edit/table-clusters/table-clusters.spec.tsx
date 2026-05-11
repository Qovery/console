import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { OrganizationCustomRoleClusterPermission } from 'qovery-typescript-axios'
import { customRolesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import TableClusters from './table-clusters'

const clusters = customRolesMock(2)[0].cluster_permissions || []

describe('TableClusters', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<TableClusters clusters={clusters} />))
    expect(baseElement).toBeTruthy()
  })

  it('should toggle the global permission checkbox', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<TableClusters clusters={clusters} />))

    const adminCheckbox = screen.getByTestId(`checkbox-${OrganizationCustomRoleClusterPermission.ADMIN}`)

    await userEvent.click(adminCheckbox)

    expect(adminCheckbox).toBeChecked()
  })

  it('should render a row per cluster', () => {
    renderWithProviders(wrapWithReactHookForm(<TableClusters clusters={clusters} />))

    clusters.forEach((cluster) => {
      expect(screen.getByText(cluster.cluster_name)).toBeInTheDocument()
    })
  })
})

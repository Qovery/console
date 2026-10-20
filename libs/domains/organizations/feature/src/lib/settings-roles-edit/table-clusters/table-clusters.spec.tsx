import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { customRolesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import TableClusters from './table-clusters'

const clusters = customRolesMock(2)[0].cluster_permissions || []

describe('TableClusters', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<TableClusters clusters={clusters} />))
    expect(baseElement).toBeTruthy()
  })

  it('should not offer to set all the clusters at once', () => {
    renderWithProviders(wrapWithReactHookForm(<TableClusters clusters={clusters} />))

    // a permission applies to the listed clusters only: a new cluster gets read-only
    expect(screen.queryByText('All Clusters')).not.toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(clusters.length * 3)
  })

  it('should render a row per cluster', () => {
    renderWithProviders(wrapWithReactHookForm(<TableClusters clusters={clusters} />))

    clusters.forEach((cluster) => {
      expect(screen.getByText(cluster.cluster_name)).toBeInTheDocument()
    })
  })
})

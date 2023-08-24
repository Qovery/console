import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { OrganizationCustomRoleClusterPermission } from 'qovery-typescript-axios'
import { customRolesMock } from '@qovery/shared/factories'
import TableClusters, { type TableClustersProps } from './table-clusters'

const clusters = customRolesMock(1)[0].cluster_permissions || []

const props: TableClustersProps = {
  clusters: clusters,
}

describe('TableClusters', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<TableClusters {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should set all checkbox', async () => {
    const { getByTestId, getAllByTestId } = render(wrapWithReactHookForm(<TableClusters {...props} />))

    const checkbox = getByTestId(`checkbox-${OrganizationCustomRoleClusterPermission.ADMIN}`)

    fireEvent.click(checkbox)

    await act(() => {
      const radios = getAllByTestId(`checkbox-${OrganizationCustomRoleClusterPermission.ADMIN}`)

      for (let i = 0; i < radios.length; i++) {
        const radio = radios[i] as HTMLInputElement
        expect(radio.checked).toBe(true)
      }
    })
  })
})

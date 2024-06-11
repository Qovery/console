import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type OrganizationCustomRoleClusterPermissionsInner } from 'qovery-typescript-axios'
import { customRolesMock } from '@qovery/shared/factories'
import RowCluster from './row-cluster'

const clusters = customRolesMock(1)[0].cluster_permissions as OrganizationCustomRoleClusterPermissionsInner[]

describe('RowCluster', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<RowCluster cluster={clusters[0]} />))
    expect(baseElement).toBeTruthy()
  })
})

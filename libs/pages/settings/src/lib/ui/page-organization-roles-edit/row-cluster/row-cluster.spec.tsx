import { render } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { customRolesMock } from '@qovery/shared/factories'
import RowCluster from './row-cluster'

const clusters = customRolesMock(1)[0].cluster_permissions

describe('RowCluster', () => {
  it('should render successfully', () => {
    if (clusters && clusters.length > 0) {
      const { baseElement } = render(wrapWithReactHookForm(<RowCluster cluster={clusters[0]} />))
      expect(baseElement).toBeTruthy()
    }
  })
})

import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  OrganizationCustomRoleClusterPermission,
  type OrganizationCustomRoleClusterPermissionsInner,
} from 'qovery-typescript-axios'
import { customRolesMock } from '@qovery/shared/factories'
import RowCluster from './row-cluster'

const clusters = customRolesMock(1)[0].cluster_permissions as OrganizationCustomRoleClusterPermissionsInner[]

describe('RowCluster', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<RowCluster cluster={clusters[0]} />))
    expect(baseElement).toBeTruthy()
  })

  it('should set permission to VIEWER when clicking an already-selected cluster permission (AC-3)', async () => {
    const defaultValues = {
      cluster_permissions: {
        '1': OrganizationCustomRoleClusterPermission.ADMIN,
      },
    }

    const { container } = render(wrapWithReactHookForm(<RowCluster cluster={clusters[0]} />, { defaultValues }))

    const adminInput = container.querySelector('input[value="ADMIN"]') as HTMLInputElement
    expect(adminInput).toBeChecked()

    await act(() => {
      fireEvent.click(adminInput)
    })

    expect(adminInput).not.toBeChecked()

    const viewerInput = container.querySelector('input[value="VIEWER"]') as HTMLInputElement
    expect(viewerInput).toBeChecked()
  })
})

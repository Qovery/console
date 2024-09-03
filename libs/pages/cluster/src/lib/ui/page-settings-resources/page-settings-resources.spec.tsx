import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsResources, { type PageSettingsResourcesProps } from './page-settings-resources'

const props: PageSettingsResourcesProps = {
  loading: false,
  cluster: clusterFactoryMock(1)[0],
  onSubmit: jest.fn(),
}

describe('PageSettingsResources', () => {
  let defaultValues: ClusterResourcesData

  beforeEach(() => {
    defaultValues = {
      instance_type: 't3.medium',
      disk_size: 50,
      cluster_type: 'MANAGED',
      nodes: [1, 3],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(<PageSettingsResources {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

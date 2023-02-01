import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ClusterResourcesData } from '@qovery/shared/interfaces'
import PageSettingsResources, { PageSettingsResourcesProps } from './page-settings-resources'

const props: PageSettingsResourcesProps = {
  loading: false,
  clusterRegion: 'eu-west-1',
  cloudProvider: CloudProviderEnum.AWS,
  onSubmit: jest.fn(),
}

describe('PageSettingsResources', () => {
  let defaultValues: ClusterResourcesData

  beforeEach(() => {
    defaultValues = {
      instance_type: 't3.medium',
      disk_size: 20,
      cluster_type: 'MANAGED',
      nodes: [1, 3],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<ClusterResourcesData>(<PageSettingsResources {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import PageSettingsResources, { type PageSettingsResourcesProps } from './page-settings-resources'

const mockInstanceType = [
  {
    name: 't2.micro',
    cpu: 1,
    ram_in_gb: 1,
    type: 't2.micro',
    architecture: 'arm64',
  },
  {
    name: 't2.small',
    cpu: 1,
    ram_in_gb: 2,
    type: 't2.small',
    architecture: 'arm64',
  },
  {
    name: 't2.medium',
    cpu: 2,
    ram_in_gb: 4,
    type: 't2.medium',
    architecture: 'x86_64',
  },
]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editCluster: jest.fn(),
    selectInstancesTypes: () => mockInstanceType,
  }
})

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
      disk_size: 50,
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

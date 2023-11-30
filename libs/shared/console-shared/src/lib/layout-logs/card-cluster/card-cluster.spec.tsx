import { CloudProviderEnum, StateEnum } from 'qovery-typescript-axios'
import * as domainsClustersFeature from '@qovery/domains/clusters/feature'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CardCluster, { type CardClusterProps, splitId } from './card-cluster'

describe('CardCluster', () => {
  const cluster = clusterFactoryMock(1)[0]

  const props: CardClusterProps = {
    clusterId: '1',
    organizationId: '0',
  }

  it('should render successfully', () => {
    jest.spyOn(domainsClustersFeature, 'useCluster').mockReturnValue({
      data: cluster,
    })
    jest.spyOn(domainsClustersFeature, 'useClusterStatus').mockReturnValue({
      data: {
        status: StateEnum.STOPPED,
      },
    })
    const { baseElement } = renderWithProviders(<CardCluster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    jest.spyOn(domainsClustersFeature, 'useCluster').mockReturnValue({
      data: {
        id: 'fff-fff-fff-fff',
        created_at: '',
        name: '',
        region: '',
        cloud_provider: CloudProviderEnum.AWS,
      },
    })
    jest.spyOn(domainsClustersFeature, 'useClusterStatus').mockReturnValue({
      data: {
        status: StateEnum.STOPPED,
      },
    })

    const { container } = renderWithProviders(<CardCluster {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should have a icon for cloud provider', () => {
    const cloud_provider = CloudProviderEnum.AWS
    jest.spyOn(domainsClustersFeature, 'useCluster').mockReturnValue({
      data: {
        id: 'fff-fff-fff-fff',
        created_at: '',
        name: '',
        region: '',
        cloud_provider,
      },
    })
    jest.spyOn(domainsClustersFeature, 'useClusterStatus').mockReturnValue({
      data: {
        status: StateEnum.STOPPED,
      },
    })

    renderWithProviders(<CardCluster {...props} />)

    const icon = screen.getByTestId('icon')

    expect(icon?.getAttribute('name')).toBe(`${cloud_provider}_GRAY`)
  })

  it('should have function to split id', () => {
    const id = 'fff-fff-fff-fff'
    jest.spyOn(domainsClustersFeature, 'useCluster').mockReturnValue({
      data: {
        id,
        created_at: '',
        name: '',
        region: '',
        cloud_provider: CloudProviderEnum.AWS,
      },
    })
    jest.spyOn(domainsClustersFeature, 'useClusterStatus').mockReturnValue({
      data: {
        status: StateEnum.STOPPED,
      },
    })

    renderWithProviders(<CardCluster {...props} />)

    expect(splitId(id)).toBe('fff[...]fff')
  })

  renderWithProviders(<CardCluster {...props} />)
})

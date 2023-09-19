import { CloudProviderEnum, StateEnum } from 'qovery-typescript-axios'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { clusterFactoryMock, organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CardCluster, { type CardClusterProps, splitId } from './card-cluster'

describe('CardCluster', () => {
  const cluster = clusterFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  const props: CardClusterProps = {
    cluster: cluster,
    organizationId: organization.id,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CardCluster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    props.cluster = {
      id: 'fff-fff-fff-fff',
      created_at: '',
      name: '',
      region: '',
      cloud_provider: CloudProviderEnum.AWS,
      extendedStatus: {
        loadingStatus: 'loaded',
        status: {
          status: StateEnum.STOPPED,
        },
      },
    }

    const { container } = renderWithProviders(<CardCluster {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should have a icon for cloud provider', () => {
    props.cluster = {
      id: 'fff-fff-fff-fff',
      created_at: '',
      name: '',
      region: '',
      cloud_provider: CloudProviderEnum.AWS,
    }

    renderWithProviders(<CardCluster {...props} />)

    const icon = screen.getByTestId('icon')

    expect(icon?.getAttribute('name')).toBe(`${props.cluster.cloud_provider}_GRAY`)
  })

  it('should have function to split id', () => {
    props.cluster = {
      id: 'fff-fff-fff-fff',
      created_at: '',
      name: '',
      region: '',
      cloud_provider: CloudProviderEnum.AWS,
    }

    renderWithProviders(<CardCluster {...props} />)

    expect(splitId(props.cluster.id)).toBe('fff[...]fff')
  })

  renderWithProviders(<CardCluster {...props} />)
})

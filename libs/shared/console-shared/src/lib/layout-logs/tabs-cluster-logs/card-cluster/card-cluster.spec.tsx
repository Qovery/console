import { render, screen } from '__tests__/utils/setup-jest'
import { CloudProviderEnum, StateEnum } from 'qovery-typescript-axios'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { clusterFactoryMock, organizationFactoryMock } from '@qovery/shared/factories'
import CardCluster, { CardClusterProps, splitId } from './card-cluster'

describe('CardCluster', () => {
  const cluster = clusterFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  const props: CardClusterProps = {
    cluster: cluster,
    organizationId: organization.id,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<CardCluster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a status chip', () => {
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

    render(<CardCluster {...props} />)

    const status = screen.getByTestId('status')
    const svg = status.querySelector('svg')

    expect(svg?.getAttribute('name')).toBe('PAUSE')
  })

  it('should have a icon for cloud provider', () => {
    props.cluster = {
      id: 'fff-fff-fff-fff',
      created_at: '',
      name: '',
      region: '',
      cloud_provider: CloudProviderEnum.AWS,
    }

    render(<CardCluster {...props} />)

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

    render(<CardCluster {...props} />)

    expect(splitId(props.cluster.id)).toBe('fff[...]fff')
  })

  render(<CardCluster {...props} />)
})

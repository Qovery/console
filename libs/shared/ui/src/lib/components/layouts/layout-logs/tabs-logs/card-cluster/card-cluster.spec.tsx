import { CloudProviderEnum, StateEnum } from 'qovery-typescript-axios'
import { screen, render } from '__tests__/utils/setup-jest'
import { clusterFactoryMock, organizationFactoryMock } from '@console/domains/organization'

import CardCluster, { CardClusterProps, splitId } from './card-cluster'

describe('CardCluster', () => {
  const cluster = clusterFactoryMock(1)[0]
  const organization = organizationFactoryMock(1)[0]

  const props: CardClusterProps = {
    id: cluster.id,
    name: cluster.name,
    cloud_provider: cluster.cloud_provider,
    region: cluster.name,
    organizationId: organization.id,
    status: StateEnum.RUNNING,
    version: cluster.version,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<CardCluster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a status chip', () => {
    props.status = StateEnum.STOPPED

    render(<CardCluster {...props} />)

    const status = screen.getByTestId('status')
    const svg = status.querySelector('svg')

    expect(svg?.getAttribute('name')).toBe('PAUSE')
  })

  it('should have a icon for cloud provider', () => {
    props.cloud_provider = CloudProviderEnum.AWS

    render(<CardCluster {...props} />)

    const icon = screen.getByTestId('icon')

    expect(icon?.getAttribute('name')).toBe(`${props.cloud_provider}_GRAY`)
  })

  it('should have function to split id', () => {
    props.id = 'fff-fff-fff-fff'

    render(<CardCluster {...props} />)

    expect(splitId(props.id)).toBe('fff[...]fff')
  })

  render(<CardCluster {...props} />)
})

import { render } from '__tests__/utils/setup-jest'
import { clusterFactoryMock } from '@qovery/domains/organization'
import CardCluster, { CardClusterProps } from './card-cluster'

describe('CardCluster', () => {
  const props: CardClusterProps = {
    cluster: clusterFactoryMock(1)[0],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<CardCluster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have tags', () => {
    props.cluster.is_default = true

    const { getByTestId } = render(<CardCluster {...props} />)

    expect(getByTestId('tag-default')).toBeInTheDocument()
    expect(getByTestId('tag-region').textContent).toBe(props.cluster.region)
    expect(getByTestId('tag-version').textContent).toBe(props.cluster.version)
    expect(getByTestId('tag-instance').textContent).toBe(props.cluster.instance_type)
  })

  it('should have a name', () => {
    const { baseElement } = render(<CardCluster {...props} />)

    expect(baseElement.querySelector('h2')?.textContent).toBe(props.cluster.name)
  })
})

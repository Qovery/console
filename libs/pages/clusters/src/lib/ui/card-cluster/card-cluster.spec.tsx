import { StateEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { getStatusClusterMessage } from '@qovery/shared/util-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CardCluster, { type CardClusterProps, getColorForStatus } from './card-cluster'

jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useClusterStatus: () => ({
    data: {
      state: 'READY',
    },
    isLoading: false,
    error: {},
  }),
}))

describe('CardCluster', () => {
  let props: CardClusterProps

  beforeEach(() => {
    props = {
      cluster: clusterFactoryMock(1)[0],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CardCluster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have tags', () => {
    props.cluster.is_default = true
    props.cluster.production = true

    const { getByTestId } = renderWithProviders(<CardCluster {...props} />)

    expect(screen.getByTestId('tag-prod')).toBeInTheDocument()
    expect(screen.getByTestId('tag-default')).toBeInTheDocument()
    expect(screen.getByTestId('tag-region')).toHaveTextContent(props.cluster.region)
    expect(screen.getByTestId('tag-version')).toHaveTextContent(props.cluster.version)
    expect(screen.getByTestId('tag-instance')).toHaveTextContent(
      props.cluster.instance_type?.toLowerCase().replace('_', '.')
    )
  })

  it('should have a name', () => {
    const { baseElement } = renderWithProviders(<CardCluster {...props} />)

    expect(baseElement.querySelector('h2')?.textContent).toBe(props.cluster.name)
  })

  it('should have a status message', async () => {
    const { getByTestId } = renderWithProviders(<CardCluster {...props} />)
    expect(screen.getByTestId('status-message')).toHaveTextContent(new RegExp(getStatusClusterMessage(StateEnum.READY)))
  })

  it('should have a function to display color by status', () => {
    expect(getColorForStatus(StateEnum.DELETING)).toBe('text-orange-500')
    expect(getColorForStatus(StateEnum.STOP_ERROR)).toBe('text-red-500')
    expect(getColorForStatus(StateEnum.READY)).toBe('text-brand-500')
  })
})

import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import CrudModalFeature, { type CrudModalFeatureProps, handleSubmit } from './crud-modal-feature'

const cluster = clusterFactoryMock(1)[0]

const route = cluster.routingTable?.items && cluster.routingTable?.items[0]
const useEditRoutingTableMockSpy = jest.spyOn(clustersDomain, 'useEditRoutingTable') as jest.Mock

const props: CrudModalFeatureProps = {
  route: route,
  routes: cluster.routingTable?.items,
  organizationId: '0',
  clusterId: cluster.id,
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  const editRoutingTable = jest.fn()
  beforeEach(() => {
    useEditRoutingTableMockSpy.mockReturnValue({
      mutateAsync: editRoutingTable,
    })
  })

  it('should render successfully', async () => {
    const { baseElement } = render(<CrudModalFeature {...props} />)
    await act(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  it('should submit a new route', () => {
    const routes = handleSubmit(
      { destination: '10.0.0.0/20', target: 'my-target', description: 'my-desc' },
      cluster?.routingTable?.items
    )

    expect(routes).toStrictEqual([
      {
        destination: route?.destination,
        target: route?.target,
        description: route?.description,
      },
      {
        destination: '10.0.0.0/20',
        target: 'my-target',
        description: 'my-desc',
      },
    ])
  })

  it('should submit a edit route', () => {
    const routes = handleSubmit(
      { destination: route?.destination, target: 'my-target', description: 'my-desc' },
      cluster?.routingTable?.items,
      route
    )

    expect(routes).toStrictEqual([
      {
        destination: route?.destination,
        target: 'my-target',
        description: 'my-desc',
      },
    ])
  })

  it('should edit ClusterRoutingTable if form is submitted', async () => {
    const { getByTestId } = render(<CrudModalFeature {...props} />)

    await act(() => {
      const inputDestination = getByTestId('input-destination')
      const inputTarget = getByTestId('input-target')
      fireEvent.input(inputDestination, { target: { value: '10.0.0.0/20' } })
      fireEvent.input(inputTarget, { target: { value: 'test' } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    const routes = handleSubmit(
      { destination: '10.0.0.0/20', target: 'test', description: 'my description' },
      cluster?.routingTable?.items,
      route
    )

    expect(editRoutingTable).toBeCalledWith({
      organizationId: '0',
      clusterId: cluster.id,
      routingTableRequest: { routes },
    })
  })
})

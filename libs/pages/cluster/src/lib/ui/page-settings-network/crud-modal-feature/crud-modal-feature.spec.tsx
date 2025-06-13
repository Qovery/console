import * as clustersDomain from '@qovery/domains/clusters/feature'
import { fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import CrudModalFeature, { type CrudModalFeatureProps, handleSubmit } from './crud-modal-feature'

const route = {
  destination: '10.0.0.0/16',
  target: 'pcx-0abf',
  description: 'my description',
}
const useEditRoutingTableMockSpy = jest.spyOn(clustersDomain, 'useEditRoutingTable') as jest.Mock

const props: CrudModalFeatureProps = {
  route: route,
  routes: [route],
  organizationId: '0',
  clusterId: '0',
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
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit a new route', () => {
    const routes = handleSubmit({ destination: '10.0.0.0/20', target: 'my-target', description: 'my-desc' }, [route])

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
      [route],
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
    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const inputDestination = screen.getByTestId('input-destination')
    const inputTarget = screen.getByTestId('input-target')
    fireEvent.input(inputDestination, { target: { value: '10.0.0.0/20' } })
    fireEvent.input(inputTarget, { target: { value: 'test' } })

    const button = await screen.findByTestId('submit-button')
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    await userEvent.click(button)

    const routes = handleSubmit(
      { destination: '10.0.0.0/20', target: 'test', description: 'my description' },
      [route],
      route
    )

    expect(editRoutingTable).toHaveBeenCalledWith({
      organizationId: '0',
      clusterId: '0',
      routingTableRequest: { routes },
    })
  })
})

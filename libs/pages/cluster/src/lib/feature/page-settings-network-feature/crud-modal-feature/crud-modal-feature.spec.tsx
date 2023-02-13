import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
import { clusterFactoryMock } from '@qovery/shared/factories'
import CrudModalFeature, { CrudModalFeatureProps, handleSubmit } from './crud-modal-feature'

import SpyInstance = jest.SpyInstance

const cluster = clusterFactoryMock(1)[0]

const route = cluster.routingTable?.items && cluster.routingTable?.items[0]

const props: CrudModalFeatureProps = {
  route: route,
  routes: cluster.routingTable?.items,
  organizationId: '0',
  clusterId: cluster.id,
  onClose: jest.fn(),
}

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editClusterRoutingTable: jest.fn(),
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('CrudModalFeature', () => {
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

  it('should dispatch editClusterRoutingTable if form is submitted', async () => {
    const editClusterSpy: SpyInstance = jest.spyOn(storeOrganization, 'editClusterRoutingTable')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

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

    expect(editClusterSpy.mock.calls[0][0].organizationId).toStrictEqual('0')
    expect(editClusterSpy.mock.calls[0][0].clusterId).toStrictEqual(cluster.id)
    expect(editClusterSpy.mock.calls[0][0].routes).toStrictEqual(routes)
  })
})

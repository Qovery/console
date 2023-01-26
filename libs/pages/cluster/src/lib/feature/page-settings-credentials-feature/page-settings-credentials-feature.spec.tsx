import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { ClusterEntity } from '@qovery/shared/interfaces'
import PageSettingsGeneralFeature, { handleSubmit } from './page-settings-credentials-feature'

import SpyInstance = jest.SpyInstance

const mockCluster: ClusterEntity = clusterFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editCluster: jest.fn(),
    getClusterState: () => ({
      loadingStatus: 'loaded',
      ids: [mockCluster.id],
      entities: {
        [mockCluster.id]: mockCluster,
      },
      error: null,
    }),
    selectClusterById: () => mockCluster,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '0', clusterId: mockCluster.id }),
}))

describe('PageSettingsGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should update the cluster with fields', () => {
    const currentCluster = handleSubmit(
      {
        name: 'hello',
        description: 'description',
        production: true,
      },
      mockCluster
    )
    expect(currentCluster.name).toBe('hello')
    expect(currentCluster.description).toBe('description')
    expect(currentCluster.production).toBe(true)
  })

  it('should dispatch editCluster if form is submitted', async () => {
    const editClusterSpy: SpyInstance = jest.spyOn(storeOrganization, 'editCluster')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<PageSettingsGeneralFeature />)

    await act(() => {
      const input = getByTestId('input-name')
      fireEvent.input(input, { target: { value: 'hello' } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    const cloneCluster = handleSubmit(
      { name: 'hello', description: mockCluster.description, production: mockCluster.production },
      mockCluster
    )

    expect(editClusterSpy).toHaveBeenCalledWith({
      organizationId: '0',
      clusterId: mockCluster.id,
      data: cloneCluster,
    })
  })
})

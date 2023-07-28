import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { ClusterEntity } from '@qovery/shared/interfaces'
import PageSettingsRemoteFeature, { handleSubmit } from './page-settings-remote-feature'

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
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0', clusterId: mockCluster.id }),
}))

describe('PageSettingsRemoteFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsRemoteFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should update the cluster with fields', () => {
    const currentCluster = handleSubmit(
      {
        ssh_key: 'ssh_key',
      },
      mockCluster
    )
    expect(currentCluster.ssh_keys).toStrictEqual(['ssh_key'])
  })

  it('should dispatch editCluster if form is submitted', async () => {
    const editClusterSpy: SpyInstance = jest.spyOn(storeOrganization, 'editCluster')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByLabelText, getByTestId } = render(<PageSettingsRemoteFeature />)

    await act(() => {
      const input = getByLabelText('SSH Key')
      fireEvent.input(input, { target: { value: 'hello' } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    const cloneCluster = handleSubmit({ ssh_key: 'hello' }, mockCluster)

    expect(editClusterSpy.mock.calls[0][0].organizationId).toStrictEqual('0')
    expect(editClusterSpy.mock.calls[0][0].clusterId).toStrictEqual(mockCluster.id)
    expect(editClusterSpy.mock.calls[0][0].data).toStrictEqual(cloneCluster)
  })
})

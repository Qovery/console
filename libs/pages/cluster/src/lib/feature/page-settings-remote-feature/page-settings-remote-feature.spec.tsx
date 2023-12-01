import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as clustersDomains from '@qovery/domains/clusters/feature'
import * as storeOrganization from '@qovery/domains/organization'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageSettingsRemoteFeature, { handleSubmit } from './page-settings-remote-feature'

import SpyInstance = jest.SpyInstance

const mockCluster = clusterFactoryMock(1)[0]

const useClusterMockSpy = jest.spyOn(clustersDomains, 'useCluster') as jest.Mock

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
  beforeEach(() => {
    useClusterMockSpy.mockReturnValue({
      data: mockCluster,
      isLoading: false,
    })
  })

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

    expect(editClusterSpy).toBeCalledWith({
      organizationId: '0',
      clusterId: mockCluster.id,
      data: cloneCluster,
      toasterCallback: expect.anything(),
    })
  })
})

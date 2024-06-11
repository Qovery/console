import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageSettingsRemoteFeature, { handleSubmit } from './page-settings-remote-feature'

const mockCluster = clusterFactoryMock(1)[0]

const useClusterMockSpy = jest.spyOn(clustersDomain, 'useCluster') as jest.Mock
const useEditClusterMockSpy = jest.spyOn(clustersDomain, 'useEditCluster') as jest.Mock

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0', clusterId: mockCluster.id }),
}))

describe('PageSettingsRemoteFeature', () => {
  const editCluster = jest.fn()
  beforeEach(() => {
    useClusterMockSpy.mockReturnValue({
      data: mockCluster,
      isLoading: false,
    })
    useEditClusterMockSpy.mockReturnValue({
      mutateAsync: editCluster,
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

  it('should edit Cluster if form is submitted', async () => {
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

    expect(editCluster).toHaveBeenCalledWith({
      organizationId: '0',
      clusterId: mockCluster.id,
      clusterRequest: cloneCluster,
    })
  })
})

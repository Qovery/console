import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as clustersDomains from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageSettingsGeneralFeature, { handleSubmit } from './page-settings-general-feature'

const mockCluster = clusterFactoryMock(1)[0]

const useClusterMockSpy = jest.spyOn(clustersDomains, 'useCluster') as jest.Mock
const useEditClusterMockSpy = jest.spyOn(clustersDomains, 'useEditCluster') as jest.Mock

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0', clusterId: mockCluster.id }),
}))

describe('PageSettingsGeneralFeature', () => {
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

  it('should edit Cluster if form is submitted', async () => {
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

    expect(editCluster).toBeCalledWith({
      organizationId: '0',
      clusterId: mockCluster.id,
      clusterRequest: cloneCluster,
    })
  })
})

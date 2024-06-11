import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsGeneralFeature, { handleSubmit } from './page-settings-general-feature'

const mockCluster = clusterFactoryMock(1)[0]

const useClusterMockSpy = jest.spyOn(clustersDomain, 'useCluster') as jest.Mock
const useEditClusterMockSpy = jest.spyOn(clustersDomain, 'useEditCluster') as jest.Mock

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
    const { baseElement } = renderWithProviders(<PageSettingsGeneralFeature />)
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
    const { userEvent } = renderWithProviders(<PageSettingsGeneralFeature />)

    await userEvent.clear(screen.getByTestId('input-name'))
    await userEvent.type(screen.getByTestId('input-name'), 'hello')

    expect(screen.getByTestId('submit-button')).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const cloneCluster = handleSubmit(
      { name: 'hello', description: mockCluster.description, production: mockCluster.production },
      mockCluster
    )

    expect(editCluster).toHaveBeenCalledWith({
      organizationId: '0',
      clusterId: mockCluster.id,
      clusterRequest: cloneCluster,
    })
  })
})

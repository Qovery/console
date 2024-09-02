import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageClustersGeneral, { type PageClustersGeneralProps } from './page-clusters-general'

const clusters = clusterFactoryMock(2)

describe('PageClustersGeneral', () => {
  const props: PageClustersGeneralProps = {
    clusters,
    clusterStatuses: [
      {
        status: 'BUILDING',
      },
    ],
    loading: false,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageClustersGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an loader spinner', () => {
    props.loading = true
    props.clusters = []

    renderWithProviders(<PageClustersGeneral {...props} />)
    screen.getByTestId('spinner')
  })

  it('should have an empty screen', () => {
    props.loading = false
    props.clusters = []

    renderWithProviders(<PageClustersGeneral {...props} />)
    const emptyStateElement = screen.getByText('No cluster set')
    expect(emptyStateElement).toBeInTheDocument()
  })

  it('should have a list of clusters', () => {
    props.loading = false
    props.clusters = clusterFactoryMock(1)

    renderWithProviders(<PageClustersGeneral {...props} />)
    const clusterNameElement = screen.getByText(props.clusters[0].name)
    expect(clusterNameElement).toBeInTheDocument()
  })
})

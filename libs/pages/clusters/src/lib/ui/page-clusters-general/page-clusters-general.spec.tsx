import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageClustersGeneral, { type PageClustersGeneralProps } from './page-clusters-general'

describe('PageClustersGeneral', () => {
  const props: PageClustersGeneralProps = {
    clusters: clusterFactoryMock(2),
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
    screen.getByText('No cluster set')
  })

  it('should have an list of registries', () => {
    props.loading = false
    props.clusters = clusterFactoryMock(1)

    renderWithProviders(<PageClustersGeneral {...props} />)
    screen.getByTestId(`cluster-list-${props.clusters[0].id}`)
  })
})

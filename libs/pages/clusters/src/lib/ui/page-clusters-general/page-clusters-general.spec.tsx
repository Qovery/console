import { render } from '__tests__/utils/setup-jest'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageClustersGeneral, { type PageClustersGeneralProps } from './page-clusters-general'

describe('PageClustersGeneral', () => {
  const props: PageClustersGeneralProps = {
    clusters: clusterFactoryMock(2),
    loading: false,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PageClustersGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an loader spinner', () => {
    props.loading = true
    props.clusters = []

    const { getByTestId } = render(<PageClustersGeneral {...props} />)

    getByTestId('clusters-loader')
  })

  it('should have an empty screen', () => {
    props.loading = false
    props.clusters = []

    const { getByTestId } = render(<PageClustersGeneral {...props} />)

    getByTestId('empty-state')
  })

  it('should have an list of registries', () => {
    props.loading = false
    props.clusters = clusterFactoryMock(1)

    const { getByTestId } = render(<PageClustersGeneral {...props} />)

    getByTestId(`cluster-list-${props.clusters[0].id}`)
  })
})

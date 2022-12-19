import { render } from '__tests__/utils/setup-jest'
import PageClustersGeneralFeature from './page-clusters-general-feature'

describe('PageClustersGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageClustersGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import CardClusterFeature from './card-cluster-feature'

describe('CardClusterFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CardClusterFeature />)
    expect(baseElement).toBeTruthy()
  })
})

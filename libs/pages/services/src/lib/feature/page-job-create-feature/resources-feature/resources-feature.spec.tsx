import { render } from '__tests__/utils/setup-jest'
import ResourcesFeature from './resources-feature'

describe('ResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })
})

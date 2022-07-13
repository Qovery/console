import TabsFeature from './tabs-feature'
import { render } from '__tests__/utils/setup-jest'

describe('TabsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TabsFeature />)
    expect(baseElement).toBeTruthy()
  })
})

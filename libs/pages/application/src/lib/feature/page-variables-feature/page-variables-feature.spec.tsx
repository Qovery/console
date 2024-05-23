import { render } from '__tests__/utils/setup-jest'
import PageVariablesFeature from './page-variables-feature'

describe('Variables', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageVariablesFeature />)
    expect(baseElement).toBeTruthy()
  })
})

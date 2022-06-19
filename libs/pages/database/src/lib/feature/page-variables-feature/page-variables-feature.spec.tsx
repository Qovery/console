import PageVariablesFeature from './page-variables-feature'
import { render } from '__tests__/utils/setup-jest'

describe('Variables', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageVariablesFeature />)
    expect(baseElement).toBeTruthy()
  })
})

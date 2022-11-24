import { render } from '__tests__/utils/setup-jest'
import VariableFeature from './variable-feature'

describe('VariableFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VariableFeature />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import GeneralFeature from './general-feature'

describe('GeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})

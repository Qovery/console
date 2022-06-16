import LastCommitFeature from './last-commit-feature'
import { render } from '__tests__/utils/setup-jest'

describe('LastCommitFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LastCommitFeature />)
    expect(baseElement).toBeTruthy()
  })
})

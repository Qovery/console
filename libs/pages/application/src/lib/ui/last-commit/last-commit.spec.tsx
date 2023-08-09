import { render } from '__tests__/utils/setup-jest'
import LastCommit from './last-commit'

describe('LastCommit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LastCommit />)
    expect(baseElement).toBeTruthy()
  })
})

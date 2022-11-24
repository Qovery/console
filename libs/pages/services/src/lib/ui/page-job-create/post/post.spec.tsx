import { render } from '__tests__/utils/setup-jest'
import Post from './post'

describe('Post', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Post />)
    expect(baseElement).toBeTruthy()
  })
})

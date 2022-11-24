import { render } from '__tests__/utils/setup-jest'
import PostFeature from './post-feature'

describe('PostFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PostFeature />)
    expect(baseElement).toBeTruthy()
  })
})

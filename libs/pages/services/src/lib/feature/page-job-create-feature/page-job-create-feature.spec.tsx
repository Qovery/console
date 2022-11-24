import { render } from '__tests__/utils/setup-jest'
import PageJobCreateFeature from './page-job-create-feature'

describe('PageJobCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageJobCreateFeature />)
    expect(baseElement).toBeTruthy()
  })
})

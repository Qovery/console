import { render } from '__tests__/utils/setup-jest'
import PageJobCreate from './page-job-create'

describe('PageJobCreate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageJobCreate />)
    expect(baseElement).toBeTruthy()
  })
})

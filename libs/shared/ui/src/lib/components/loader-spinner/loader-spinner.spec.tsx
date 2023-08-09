import { render } from '__tests__/utils/setup-jest'
import LoaderSpinner from './loader-spinner'

describe('LoaderSpinner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoaderSpinner />)
    expect(baseElement).toBeTruthy()
  })
})

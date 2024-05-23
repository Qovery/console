import { render } from '__tests__/utils/setup-jest'
import LoadingScreen from './loading-screen'

describe('LoadingScreen', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoadingScreen />)
    expect(baseElement).toBeTruthy()
  })
})

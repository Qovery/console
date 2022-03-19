import App from './app'
import { render } from '__tests__/utils/setup-jest'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />)

    expect(baseElement).toBeTruthy()
  })
})

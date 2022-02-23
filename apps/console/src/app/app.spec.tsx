import App from './app'
import { render } from '__mocks__/utils/test-utils'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />)

    expect(baseElement).toBeTruthy()
  })
})

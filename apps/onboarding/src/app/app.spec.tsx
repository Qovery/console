import { render } from '__tests__/utils/setup-jest'

import App from './app'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />)

    expect(baseElement).toBeTruthy()
  })
})

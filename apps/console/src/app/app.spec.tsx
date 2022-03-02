import App from './app'
import { renderWithRouter } from '__mocks__/utils/test-utils'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<App />)

    expect(baseElement).toBeTruthy()
  })
})

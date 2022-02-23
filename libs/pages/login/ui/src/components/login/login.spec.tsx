import { render } from '__mocks__/utils/test-utils'

import Login from './login'

const provider = (provider: string) => {
  return
}

describe('Login', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Login authLogin={provider} />)
    expect(baseElement).toBeTruthy()
  })
})

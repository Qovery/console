import { render } from '__tests__/utils/setup-jest'
import FormUser from './form-user'

describe('FormUser', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FormUser />)
    expect(baseElement).toBeTruthy()
  })
})

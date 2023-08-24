import { render } from '__tests__/utils/setup-jest'
import FormUser, { type FormUserProps } from './form-user'

describe('FormUser', () => {
  let props: FormUserProps

  beforeEach(() => {
    props = {
      setStepCompany: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<FormUser {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

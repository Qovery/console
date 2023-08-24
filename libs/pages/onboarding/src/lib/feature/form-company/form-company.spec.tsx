import { render } from '__tests__/utils/setup-jest'
import FormCompany, { type FormCompanyProps } from './form-company'

describe('FormCompany', () => {
  let props: FormCompanyProps

  beforeEach(() => {
    props = {
      setStepCompany: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<FormCompany {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

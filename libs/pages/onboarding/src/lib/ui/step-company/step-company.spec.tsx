import { render } from '__tests__/utils/setup-jest'
import { useForm } from 'react-hook-form'
import StepCompany, { StepCompanyProps } from './step-company'

describe('StepCompany', () => {
  let props: StepCompanyProps

  beforeEach(() => {
    props = {
      dataRole: [{ label: 'some-label', value: 'some-value' }],
      dataSize: [{ label: 'some-label', value: 'some-value' }],
      onSubmit: jest.fn(),
      control: null as any,
      setStepCompany: jest.fn(),
    }

    const Wrapper = () => {
      const { control } = useForm<{
        company_name: string
        company_size: number
        user_role: string
      }>()

      props.control = control

      return <StepCompany {...props} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepCompany {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

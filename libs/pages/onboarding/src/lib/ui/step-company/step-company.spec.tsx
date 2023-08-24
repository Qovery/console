import { render } from '__tests__/utils/setup-jest'
import { type CompanySizeEnum } from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
import StepCompany, { type StepCompanyProps } from './step-company'

describe('StepCompany', () => {
  let props: Partial<StepCompanyProps>

  beforeEach(() => {
    props = {
      dataRole: [{ label: 'some-label', value: 'some-value' }],
      dataSize: [{ label: 'some-label', value: 'some-value' }],
      onSubmit: jest.fn(),
      setStepCompany: jest.fn(),
    }

    const Wrapper = () => {
      const { control } = useForm<{
        company_name?: string
        company_size?: CompanySizeEnum
        user_role?: string
      }>()

      props.control = control

      return <StepCompany {...(props as StepCompanyProps)} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepCompany {...(props as StepCompanyProps)} />)
    expect(baseElement).toBeTruthy()
  })
})

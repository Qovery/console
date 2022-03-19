import { render } from '__tests__/utils/setup-jest'

import StepCompany, { StepCompanyProps } from './step-company'

describe('StepCompany', () => {
  let props: StepCompanyProps

  beforeEach(() => {
    props = {
      dataRole: [{ label: 'some-label', value: 'some-value' }],
      dataSize: [{ label: 'some-label', value: 'some-value' }],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepCompany {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

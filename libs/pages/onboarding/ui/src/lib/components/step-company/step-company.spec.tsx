import { render } from '__mocks__/utils/test-utils'

import StepCompany from './step-company'

describe('StepCompany', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepCompany />)
    expect(baseElement).toBeTruthy()
  })
})

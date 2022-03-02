import { renderWithRouter } from '__mocks__/utils/test-utils'

import StepCompany from './step-company'

describe('StepCompany', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<StepCompany />)
    expect(baseElement).toBeTruthy()
  })
})

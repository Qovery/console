import { renderWithRouter } from '__mocks__/utils/test-utils'

import StepProject from './step-project'

describe('StepProject', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<StepProject />)

    expect(baseElement).toBeTruthy()
  })
})

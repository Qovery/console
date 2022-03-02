import { renderWithRouter } from '__mocks__/utils/test-utils'

import StepMore from './step-more'

describe('StepMore', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<StepMore />)
    expect(baseElement).toBeTruthy()
  })
})

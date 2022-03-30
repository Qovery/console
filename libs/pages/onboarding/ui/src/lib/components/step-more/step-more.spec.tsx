import { render } from '@testing-library/react'

import StepMore from './step-more'

describe('StepMore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepMore />)
    expect(baseElement).toBeTruthy()
  })
})

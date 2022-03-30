import { render } from '@testing-library/react'

import StepProject from './step-project'

describe('StepProject', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepProject />)
    expect(baseElement).toBeTruthy()
  })
})

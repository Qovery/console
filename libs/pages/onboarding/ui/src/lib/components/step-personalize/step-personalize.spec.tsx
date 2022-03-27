import { render } from '__tests__/utils/setup-jest'

import StepPersonalize, { StepPersonalizeProps } from './step-personalize'

describe('StepPersonalize', () => {
  let props: StepPersonalizeProps

  beforeEach(() => {
    props = {
      dataTypes: [{ label: 'some-label', value: 'some-value' }],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepPersonalize {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

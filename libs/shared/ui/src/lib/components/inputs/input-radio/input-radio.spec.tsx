import { render } from '__tests__/utils/setup-jest'

import InputRadio from './input-radio'

describe('InputRadio', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputRadio />)
    expect(baseElement).toBeTruthy()
  })
})

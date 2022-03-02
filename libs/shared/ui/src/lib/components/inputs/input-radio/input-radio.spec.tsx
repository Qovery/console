import { render } from '__mocks__/utils/test-utils'

import InputRadio from './input-radio'

describe('InputRadio', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputRadio />)
    expect(baseElement).toBeTruthy()
  })
})

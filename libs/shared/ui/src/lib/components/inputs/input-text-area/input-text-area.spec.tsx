import { render } from '__tests__/utils/setup-jest'

import InputTextArea from './input-text-area'

describe('InputTextArea', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputTextArea />)
    expect(baseElement).toBeTruthy()
  })
})

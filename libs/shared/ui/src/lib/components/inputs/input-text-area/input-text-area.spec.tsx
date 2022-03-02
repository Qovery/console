import { render } from '__mocks__/utils/test-utils'

import InputTextArea from './input-text-area'

describe('InputTextArea', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputTextArea />)
    expect(baseElement).toBeTruthy()
  })
})

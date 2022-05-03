import { render } from '__tests__/utils/setup-jest'

import General from './general'

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<General />)
    expect(baseElement).toBeTruthy()
  })
})

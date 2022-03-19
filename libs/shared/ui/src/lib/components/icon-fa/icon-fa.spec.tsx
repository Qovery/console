import { render } from '__tests__/utils/setup-jest'

import IconFa from './icon-fa'

describe('IconFa', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IconFa />)
    expect(baseElement).toBeTruthy()
  })
})

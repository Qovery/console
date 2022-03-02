import { render } from '__mocks__/utils/test-utils'

import IconFa from './icon-fa'

describe('IconFa', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IconFa />)
    expect(baseElement).toBeTruthy()
  })
})

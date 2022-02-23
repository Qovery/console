import { render } from '@testing-library/react'

import IconFa from './icon-fa'

describe('IconFa', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IconFa />)
    expect(baseElement).toBeTruthy()
  })
})

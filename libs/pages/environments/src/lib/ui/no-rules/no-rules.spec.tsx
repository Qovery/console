import { render } from '@testing-library/react'

import NoRules from './no-rules'

describe('NoRules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NoRules />)
    expect(baseElement).toBeTruthy()
  })
})

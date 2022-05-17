import { render } from '@testing-library/react'

import General from './general'

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<General />)
    expect(baseElement).toBeTruthy()
  })
})

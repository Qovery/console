import { render } from '@testing-library/react'

import LastCommit from './last-commit'

describe('LastCommit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LastCommit />)
    expect(baseElement).toBeTruthy()
  })
})

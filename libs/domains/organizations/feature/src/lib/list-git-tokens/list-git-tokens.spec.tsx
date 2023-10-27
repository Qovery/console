import { render } from '@testing-library/react'
import ListGitTokens from './list-git-tokens'

describe('ListGitTokens', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ListGitTokens />)
    expect(baseElement).toBeTruthy()
  })
})

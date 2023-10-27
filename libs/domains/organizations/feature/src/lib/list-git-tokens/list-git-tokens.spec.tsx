import { renderWithProviders } from '@qovery/shared/util-tests'
import ListGitTokens from './list-git-tokens'

describe('ListGitTokens', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ListGitTokens />)
    expect(baseElement).toBeTruthy()
  })
})

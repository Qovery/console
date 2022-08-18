import { render } from '@testing-library/react'
import GitRepositorySettings from './git-repository-settings'

describe('GitRepositorySettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GitRepositorySettings />)
    expect(baseElement).toBeTruthy()
  })
})

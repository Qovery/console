import { render } from '@testing-library/react'
import PageOrganizationGithubRepositoryAccess from './page-organization-github-repository-access'

describe('PageOrganizationGithubRepositoryAccess', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccess />)
    expect(baseElement).toBeTruthy()
  })
})

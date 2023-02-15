import { render } from '@testing-library/react'
import PageOrganizationGithubRepositoryAccessFeature from './page-organization-github-repository-access-feature'

describe('PageOrganizationGithubRepositoryAccessFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccessFeature />)
    expect(baseElement).toBeTruthy()
  })
})

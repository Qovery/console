import { render } from '@testing-library/react'
import PageApplicationCreateGeneralGitApplication from './page-application-create-general-git-application'

describe('PageApplicationCreateGeneralGitApplication', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreateGeneralGitApplication />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageApplicationCreateGeneralGitApplication from './page-application-create-general-git-application'

describe('PageApplicationCreateGeneralGitApplication', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageApplicationCreateGeneralGitApplication />))
    expect(baseElement).toBeTruthy()
  })
})

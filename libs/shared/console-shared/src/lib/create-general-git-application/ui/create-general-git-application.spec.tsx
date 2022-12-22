import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import CreateGeneralGitApplication from './create-general-git-application'

describe('CreateGeneralGitApplication', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CreateGeneralGitApplication />))
    expect(baseElement).toBeTruthy()
  })
})
